import { acquireCodexLock } from "./codex-lock";
import { codexCaseKey, type CodexStatus } from "./codex-status";
import { latestCodexObservation, recordCodexObservation } from "./codex-resume";
import { codexTargetPrompt, codexJudgePrompt } from "./codex-prompts";
/** Opt-in real Codex CLI source reviews. No OpenAI API key or fabricated API response IDs. */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  readFile,
  writeFile,
  mkdir,
  rm,
  readdir,
  rename,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createCodexReviewCases } from "./codex-cases";
import {
  validateCodexArchive,
  type CodexExecution,
  type CodexRow,
  type CodexArchive,
} from "./codex-validate";
import { evidenceDigest } from "./validate";
const scratch = resolve(".superpowers/model-run");
await mkdir(scratch, { recursive: true });
const releaseLock = acquireCodexLock(join(scratch, "codex-review.lock"));
process.once("exit", releaseLock);
process.once("SIGINT", () => process.exit(130));
process.once("SIGTERM", () => process.exit(143));
const output = join(scratch, "codex-review-current.json");
const history = join(scratch, `codex-review-${Date.now()}.json`);
const accepted = resolve("evals/fixtures/codex-source-reviews.json");
const statusPath = resolve("evals/fixtures/codex-review-status.json");
let reviewStatus: CodexStatus = JSON.parse(
  await readFile(statusPath, "utf8").catch(() =>
    JSON.stringify({
      method: "codex-cli-source-review-status",
      schemaVersion: 1,
      observations: {},
    }),
  ),
);

const model = "gpt-6.1-sol";
const schema = {
  type: "object",
  properties: {
    assessment: { type: "string", enum: ["pass", "revise"] },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["blocking", "major", "minor"] },
          location: { type: "string" },
          evidence: { type: "string" },
          suggestedFix: { type: "string" },
        },
        required: ["severity", "location", "evidence", "suggestedFix"],
        additionalProperties: false,
      },
    },
  },
  required: ["assessment", "findings"],
  additionalProperties: false,
};
const judgeSchema = {
  type: "object",
  properties: {
    judgment: { type: "string", enum: ["pass", "fail", "uncertain"] },
    reason: { type: "string" },
  },
  required: ["judgment", "reason"],
  additionalProperties: false,
};
function run(
  args: string[],
  cwd: string,
  input?: string,
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    delete env.OPENAI_API_KEY;
    const child = spawn("codex", args, {
      cwd,
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "",
      stderr = "";
    child.stdout.on("data", (c) => (stdout += c));
    child.stderr.on("data", (c) => (stderr += c));
    child.on("error", reject);
    child.on("close", (code) => resolve({ stdout, stderr, code: code ?? -1 }));
    child.stdin.end(input ?? "");
  });
}
const cliVersion = (await run(["--version"], process.cwd())).stdout.trim();
async function execute(
  prompt: string,
  schema: unknown,
  label: string,
): Promise<CodexExecution> {
  const dir = await mkdtemp(join(tmpdir(), "talksprout-codex-eval-"));
  const schemaPath = join(dir, "schema.json"),
    responsePath = join(dir, "response.json");
  await writeFile(schemaPath, JSON.stringify(schema));
  const startedAt = new Date().toISOString();
  try {
    const result = await run(
      [
        "exec",
        "--ignore-user-config",
        "--ignore-rules",
        "--ephemeral",
        "--skip-git-repo-check",
        "--sandbox",
        "read-only",
        "-m",
        model,
        "--json",
        "--output-schema",
        schemaPath,
        "--output-last-message",
        responsePath,
        "-",
      ],
      dir,
      prompt,
    );
    await writeFile(join(scratch, label + ".stderr.log"), result.stderr);
    const events = result.stdout
      .split("\n")
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return { type: "unparsed", text: l };
        }
      });
    const raw = await readFile(responsePath, "utf8").catch(() => "{}");
    const output = JSON.parse(raw);
    if (result.code !== 0)
      throw Error(
        `Codex ${label} failed with exit ${result.code}; inspect scratch stderr`,
      );
    return {
      cliVersion,
      requestedModel: model,
      startedAt,
      completedAt: new Date().toISOString(),
      exitCode: result.code,
      requestSha256: createHash("sha256").update(prompt).digest("hex"),
      events,
      output,
    };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
const expected = createCodexReviewCases();
let previous: CodexRow[] = [];
if (process.argv.includes("--resume")) {
  const histories = (await readdir(scratch))
    .filter((name) => /^codex-review-\d+\.json$/.test(name))
    .map((name) => join(scratch, name));
  for (const path of [output, ...histories, accepted]) {
    const raw = await readFile(path, "utf8").catch(() => "");
    if (!raw) continue;
    try {
      const old = JSON.parse(raw);
      if (Array.isArray(old.cases)) previous.push(...old.cases);
    } catch {
      if (path === accepted) throw Error("Accepted Codex fixture is corrupted");
    }
  }
}
for (const item of expected) {
  const status = reviewStatus.observations[codexCaseKey(item)];
  if (status && status.status !== "accepted")
    previous.push({
      case: item,
      observedAt: status.observedAt,
      observationStatus: status.status,
    });
}
let rows: CodexRow[] = expected
  .map((item) => latestCodexObservation(previous, item))
  .filter((row): row is CodexRow => !!row);
const archive = (): CodexArchive => ({
  method: "codex-cli-source-review",
  schemaVersion: 1,
  completedAt: new Date().toISOString(),
  cases: [...rows].sort((a, b) => a.case.id.localeCompare(b.case.id)),
});
let pendingSave = Promise.resolve();
const save = () => {
  const text = JSON.stringify(archive(), null, 2) + "\n";
  const statusText = JSON.stringify(reviewStatus, null, 2) + "\n";
  pendingSave = pendingSave.then(async () => {
    await mkdir(resolve("evals/fixtures"), { recursive: true });
    for (const path of [output, history, statusPath]) {
      await writeFile(path + ".tmp", path === statusPath ? statusText : text);
      await rename(path + ".tmp", path);
    }
  });
  return pendingSave;
};
// Two independent CLI processes at a time; target and judge for each case are sequential.
let cursor = 0;
async function worker() {
  while (cursor < expected.length) {
    const item = expected[cursor++];
    // A newer failed observation must never be bypassed by an older passing fixture.
    const candidate = latestCodexObservation(previous, item);
    const old =
      candidate &&
      validateCodexArchive(
        {
          method: "codex-cli-source-review",
          schemaVersion: 1,
          completedAt: new Date().toISOString(),
          cases: [candidate],
        },
        [item],
      ).issues.length === 0
        ? candidate
        : undefined;
    if (old) {
      rows = recordCodexObservation(rows, old);
      console.log("Retained " + item.id);
      continue;
    }
    rows = recordCodexObservation(rows, {
      case: item,
      observationStatus: "pending",
      observedAt: new Date().toISOString(),
    });
    reviewStatus.observations[codexCaseKey(item)] = {
      status: "pending",
      observedAt: new Date().toISOString(),
    };
    // Durable pending state is saved before any model call. All concurrent worker saves retain it.
    await save();
    let target: CodexExecution | undefined;
    try {
      console.log("Executing Codex target " + item.id);
      target = await execute(
        codexTargetPrompt(item),
        schema,
        item.id + "-target",
      );
      console.log("Executing isolated Codex judge " + item.id);
      const judge = await execute(
        codexJudgePrompt(item, target.output),
        judgeSchema,
        item.id + "-judge",
      );
      const row: CodexRow = {
        case: item,
        target,
        judge,
        observationStatus: "complete",
        observedAt: new Date().toISOString(),
      };
      row.evidenceSha256 = evidenceDigest(
        row as unknown as Record<string, unknown>,
      );
      if (
        target.output.assessment !== "pass" ||
        !Array.isArray(target.output.findings) ||
        target.output.findings.length ||
        judge.output.judgment !== "pass"
      )
        reviewStatus.observations[codexCaseKey(item)] = {
          status: "failed",
          observedAt: row.observedAt!,
        };
      rows = recordCodexObservation(rows, row);
      await save();
      console.log(
        item.id +
          ": " +
          target.output.assessment +
          " / " +
          judge.output.judgment,
      );
    } catch (error) {
      reviewStatus.observations[codexCaseKey(item)] = {
        status: "failed",
        observedAt: new Date().toISOString(),
      };
      rows = recordCodexObservation(rows, {
        case: item,
        target,
        observationStatus: "failed",
        observedAt: new Date().toISOString(),
        observationError:
          error instanceof Error ? error.message : String(error),
      });
      await save();
      throw error;
    }
  }
}
await Promise.all([worker(), worker()]);
await save();
const result = validateCodexArchive(archive(), createCodexReviewCases());
console.log(JSON.stringify(result, null, 2));
if (result.issues.length) process.exitCode = 1;
else if (process.argv.includes("--accept")) {
  await writeFile(accepted + ".tmp", JSON.stringify(archive(), null, 2) + "\n");
  await rename(accepted + ".tmp", accepted);
  for (const row of rows)
    reviewStatus.observations[codexCaseKey(row.case)] = {
      status: "accepted",
      observedAt: new Date().toISOString(),
      evidenceSha256: row.evidenceSha256,
    };
  await save();
  console.log("Accepted genuine Codex source review evidence: " + accepted);
}

releaseLock();
