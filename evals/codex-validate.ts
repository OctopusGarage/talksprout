import { validateCodexStatus } from "./codex-status";
import { createHash } from "node:crypto";
import { codexTargetPrompt, codexJudgePrompt } from "./codex-prompts";
import { evidenceDigest } from "./validate";
import type { LiveCase } from "./live-cases";
import { validateLiveArchive } from "./live-validate";
export interface CodexExecution {
  cliVersion: string;
  requestedModel: string;
  startedAt: string;
  completedAt: string;
  exitCode: number;
  requestSha256: string;
  events: Record<string, unknown>[];
  output: Record<string, unknown>;
}
export interface CodexRow {
  case: LiveCase;
  target?: CodexExecution;
  judge?: CodexExecution;
  observedAt?: string;
  observationStatus?: "pending" | "failed" | "complete";
  observationError?: string;
  evidenceSha256?: string;
}
export interface CodexArchive {
  method: "codex-cli-source-review";
  schemaVersion: 1;
  completedAt: string;
  cases: CodexRow[];
}
export function validateCodexArchive(value: unknown, expected: LiveCase[]) {
  const issues: string[] = [];
  const data = value as Partial<CodexArchive> | null;
  if (
    !data ||
    data.method !== "codex-cli-source-review" ||
    data.schemaVersion !== 1 ||
    !data.completedAt ||
    !Array.isArray(data.cases)
  )
    return { issues: ["codex: invalid archive/provenance"], cases: 0 };
  const known = new Map(expected.map((c) => [c.id, c]));
  const seen = new Set<string>();
  const threads = new Set<string>();
  for (const row of data.cases) {
    if (!row?.case?.id) {
      issues.push("codex: missing case");
      continue;
    }
    const id = row.case.id;
    const fail = (s: string) => issues.push(`${id}: ${s}`);
    if (seen.has(id)) fail("duplicate case");
    seen.add(id);
    if (row.observationStatus && row.observationStatus !== "complete") {
      fail("pending or failed Codex observation");
      continue;
    }
    const current = known.get(id);
    if (
      !current ||
      evidenceDigest(row.case as unknown as Record<string, unknown>) !==
        evidenceDigest(current as unknown as Record<string, unknown>)
    ) {
      fail("stale or unexpected source input");
      continue;
    }
    if (
      row.evidenceSha256 !==
      evidenceDigest(row as unknown as Record<string, unknown>)
    )
      fail("tampered execution evidence");
    for (const kind of ["target", "judge"] as const) {
      const exec = row[kind];
      if (
        !exec ||
        exec.exitCode !== 0 ||
        !exec.cliVersion?.startsWith("codex-cli ") ||
        !exec.requestedModel ||
        !exec.startedAt ||
        !exec.completedAt ||
        !/^[a-f0-9]{64}$/.test(exec.requestSha256 ?? "") ||
        !Array.isArray(exec.events) ||
        exec.events.some(
          (e) => !e || typeof e !== "object" || Array.isArray(e),
        ) ||
        !exec.output ||
        typeof exec.output !== "object" ||
        Array.isArray(exec.output)
      ) {
        fail(`incomplete ${kind} execution`);
        continue;
      }
      const prompt =
        kind === "target"
          ? codexTargetPrompt(row.case)
          : codexJudgePrompt(row.case, row.target?.output ?? {});
      if (
        exec.requestSha256 !== createHash("sha256").update(prompt).digest("hex")
      )
        fail(`${kind} request is not the exact source/judgment input`);
      if (
        !Number.isFinite(Date.parse(exec.startedAt)) ||
        !Number.isFinite(Date.parse(exec.completedAt)) ||
        Date.parse(exec.completedAt) < Date.parse(exec.startedAt)
      )
        fail(`${kind} invalid execution timestamps`);
      if (
        kind === "judge" &&
        exec.requestedModel !== row.target?.requestedModel
      )
        fail("same-model judge provenance mismatch");
      const thread = exec.events.find(
        (e) => e.type === "thread.started",
      )?.thread_id;
      if (typeof thread !== "string" || !thread || threads.has(thread))
        fail(`missing or reused ${kind} Codex thread`);
      else threads.add(thread);
      const completions = exec.events.filter(
        (e) => e.type === "turn.completed",
      );
      const usage = completions[0]?.usage as
        { input_tokens?: number; output_tokens?: number } | undefined;
      if (
        completions.length !== 1 ||
        !usage ||
        !Number.isInteger(usage.input_tokens) ||
        !Number.isInteger(usage.output_tokens) ||
        (usage.input_tokens ?? 0) <= 0 ||
        (usage.output_tokens ?? 0) <= 0
      )
        fail(`missing ${kind} completion/usage`);
      if (
        exec.events.filter((e) => e.type === "thread.started").length !== 1 ||
        exec.events.some((e) => e.type === "unparsed")
      )
        fail(`${kind} malformed event stream`);
      if (
        exec.events.some((e) =>
          ["turn.failed", "error"].includes(String(e.type)),
        )
      )
        fail(`${kind} execution failed`);
      const messages = exec.events
        .filter((e) => e.type === "item.completed")
        .map((e) => e.item as { type?: string; text?: string });
      if (
        exec.events
          .filter((e) => String(e.type).startsWith("item."))
          .some((e) => {
            const item = e.item as { type?: string };
            return !["agent_message", "reasoning"].includes(item?.type ?? "");
          })
      )
        fail(`${kind} used tools instead of isolated review`);
      const final = messages
        .filter((item) => item?.type === "agent_message")
        .at(-1)?.text;
      try {
        if (
          !final ||
          evidenceDigest(JSON.parse(final)) !== evidenceDigest(exec.output)
        )
          fail(`${kind} output differs from actual event`);
      } catch {
        fail(`${kind} final output is not JSON`);
      }
    }
    const target = row.target?.output;
    if (
      target?.assessment !== "pass" ||
      !Array.isArray(target.findings) ||
      target.findings.length !== 0
    )
      fail("source review has unresolved findings");
    const judge = row.judge?.output;
    if (
      judge?.judgment !== "pass" ||
      typeof judge.reason !== "string" ||
      !judge.reason.trim()
    )
      fail("independent judge did not accept source");
  }
  for (const id of known.keys())
    if (!seen.has(id)) issues.push(`${id}: missing Codex review`);
  return { issues, cases: data.cases.length };
}
/** Supersede only exact source-bound code reviews. Historical API executions remain unchanged and validated against their recorded inputs. */
export function validateGuideReviewsWithCodex(
  api: unknown,
  codex: unknown,
  current: LiveCase[],
  status: unknown,
) {
  const archive = codex as Partial<CodexArchive> | undefined;
  const rows = Array.isArray(archive?.cases) ? archive.cases : [];
  const relevant = rows.filter((r) =>
    current.some(
      (c) => c.id === r.case?.id && c.purpose === "guide-code-review",
    ),
  );
  const relevantCases = current.filter((c) =>
    relevant.some((r) => r.case.id === c.id),
  );
  const checked = validateCodexArchive(
    { ...archive, cases: relevant },
    relevantCases,
  );
  const statusIssues = validateCodexStatus(
    status,
    { cases: relevant },
    relevantCases,
  );
  const accepted =
    checked.issues.length === 0 && statusIssues.length === 0
      ? new Set(relevant.map((r) => r.case.id))
      : new Set<string>();
  const historical = api as { cases?: { case: LiveCase }[] };
  const expected = current.map((c) =>
    accepted.has(c.id)
      ? (historical.cases?.find((r) => r.case.id === c.id)?.case ?? c)
      : c,
  );
  const baseline = validateLiveArchive(api, expected);
  return {
    ...baseline,
    issues: [...baseline.issues, ...checked.issues, ...statusIssues],
    codexReviews: accepted.size,
  };
}
