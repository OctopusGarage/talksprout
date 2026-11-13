import { createHash } from "node:crypto";
import { allPrompts, prompts, reviewPrompts } from "../src/prompts";
import { promptText } from "../src/prompt-text";

export const suiteNames = [
  "openings",
  "scenarios",
  "spoken",
  "review",
] as const;
export type SuiteName = (typeof suiteNames)[number];
type Row = Record<string, unknown>;
const object = (x: unknown): x is Row =>
  !!x && typeof x === "object" && !Array.isArray(x);
const nonempty = (x: unknown): x is string =>
  typeof x === "string" && x.trim().length > 0;
const sha = (x: string) => createHash("sha256").update(x).digest("hex");
// JSON data only; array order is significant and object key order is not.
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (object(value))
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`)
      .join(",")}}`;
  const encoded = JSON.stringify(value);
  if (encoded === undefined)
    throw new Error("Evidence must contain JSON values only");
  return encoded;
}
/** Integrity seal, not an independent assessment of the authored judgment. */
export function evidenceDigest(row: Row): string {
  const { evidenceSha256: _seal, ...evidence } = row;
  return sha(canonical(evidence));
}

export function validateArchive(archives: Record<SuiteName, unknown>) {
  const issues: string[] = [];
  const results: {
    suite: SuiteName;
    cases: number;
    prompts: number;
    judgments: Record<string, number>;
  }[] = [];
  const globalIds = new Set<string>();
  for (const suite of suiteNames) {
    const archive = archives[suite];
    if (!object(archive) || !Array.isArray(archive.scenarios)) {
      issues.push(`${suite}: scenarios must be an array`);
      continue;
    }
    const rows = archive.scenarios;
    const coverage = new Map<string, number>();
    const judgments: Record<string, number> = {};
    for (const [index, value] of rows.entries()) {
      const label = `${suite}[${index}]`;
      if (!object(value)) {
        issues.push(`${label}: case must be an object`);
        continue;
      }
      const row = value;
      const id = nonempty(row.id) ? row.id : label;
      const error = (message: string) => issues.push(`${id}: ${message}`);
      if (!nonempty(row.id)) error("missing case ID");
      if (globalIds.has(id)) error("duplicate case ID");
      globalIds.add(id);
      try {
        if (row.evidenceSha256 !== evidenceDigest(row))
          error("missing or stale evidence digest");
      } catch {
        error("case evidence must contain JSON values only");
        continue;
      }
      const variant = row.variant === undefined ? "full" : row.variant;
      const source = row.source === undefined ? "current" : row.source;
      if (variant !== "full" && variant !== "spoken") error("invalid variant");
      if (source !== "current" && source !== "transcript")
        error("invalid source");
      const prompt = allPrompts.find((p) => p.id === row.promptId);
      if (!prompt) error("unknown prompt ID");
      else {
        if ((prompt.kind === "review") !== (suite === "review"))
          error("wrong prompt purpose");
        if (
          (variant === "full" || variant === "spoken") &&
          (source === "current" || source === "transcript") &&
          row.promptSha256 !== sha(promptText(prompt, variant, source))
        )
          error("stale prompt");
      }
      if (
        suite !== "review" &&
        (variant !== (suite === "spoken" ? "spoken" : "full") ||
          source !== "current")
      )
        error("wrong suite variant/source");
      if (suite === "review" && source === "transcript" && variant !== "full")
        error("unsupported transcript variant");
      const key = `${row.promptId}:${variant}:${source}`;
      coverage.set(key, (coverage.get(key) ?? 0) + 1);
      if (row.judgment !== "pass")
        error("release policy requires pass judgment");
      if (typeof row.judgment === "string")
        judgments[row.judgment] = (judgments[row.judgment] ?? 0) + 1;
      if (!nonempty(row.rationale)) error("missing rationale");
      if (suite !== "review" && !nonempty(row.criterion))
        error("missing criterion");
      if (!Array.isArray(row.turns) || !row.turns.length) {
        error("missing transcript");
        continue;
      }
      const turns = row.turns;
      if (
        turns.some(
          (t) =>
            !object(t) ||
            (t.role !== "user" && t.role !== "assistant") ||
            !nonempty(t.content),
        )
      )
        error("invalid turn role/content");
      const roles = turns.map((t) => (object(t) ? t.role : undefined));
      if (suite === "openings") {
        if (turns.length !== 1 || roles[0] !== "assistant")
          error("opening must be one assistant turn");
      } else {
        if (!roles.includes("user") || roles.at(-1) !== "assistant")
          error(
            "transcript needs learner input and a final assistant response",
          );
        // Reviews contain authored context, including consecutive learner turns.
        if (
          suite !== "review" &&
          (roles[0] !== "assistant" ||
            roles.some((role, i) => role !== (i % 2 ? "user" : "assistant")))
        )
          error("coaching turns must alternate assistant/user");
        if (suite === "review" && (roles.length < 2 || roles.at(-2) !== "user"))
          error("review response must follow a user request");
      }
      for (const [field, role] of [
        ["learnerTurns", "user"],
        ["assistantTurns", "assistant"],
      ] as const) {
        if (field in row) {
          const duplicate = row[field];
          const expected = turns
            .filter((t) => object(t) && t.role === role)
            .map((t) => t.content);
          if (
            !Array.isArray(duplicate) ||
            duplicate.length !== expected.length ||
            duplicate.some(
              (content, index) =>
                !nonempty(content) || content !== expected[index],
            )
          )
            error(`${field} disagrees with turns`);
        }
      }
      if (suite === "review" && source === "transcript") {
        if (!["transcript-isolation", "missing-transcript"].includes(id))
          error("unexpected transcript case ID");
        if (!nonempty(row.inputConstruction))
          error("missing inputConstruction");
        if (
          id === "transcript-isolation" &&
          (!nonempty(row.transcript) ||
            !/^Learner:\s*\S/m.test(row.transcript) ||
            !/^AI:\s*\S/m.test(row.transcript) ||
            row.transcript.includes("[Paste the conversation here"))
        )
          error("isolation needs a real labeled transcript");
        if (
          id === "missing-transcript" &&
          row.transcript !== undefined &&
          row.transcript !== ""
        )
          error("missing-transcript must not supply usable source");
      }
    }
    if (suite !== "review") {
      const expected = new Set(
        prompts.map(
          (p) => `${p.id}:${suite === "spoken" ? "spoken" : "full"}:current`,
        ),
      );
      for (const key of expected)
        if (
          (coverage.get(key) ?? 0) < 1 ||
          (suite === "openings" && coverage.get(key) !== 1)
        )
          issues.push(
            `${suite}: expected ${suite === "openings" ? "exactly one" : "at least one"} ${key}`,
          );
      for (const key of coverage.keys())
        if (!expected.has(key))
          issues.push(`${suite}: unexpected coverage ${key}`);
    } else {
      for (const p of reviewPrompts)
        for (const variant of ["full", "spoken"]) {
          const key = `${p.id}:${variant}:current`;
          if ((coverage.get(key) ?? 0) < 1)
            issues.push(`review: expected at least one ${key}`);
        }
      for (const id of ["transcript-isolation", "missing-transcript"]) {
        const matches = rows.filter(
          (r) =>
            object(r) &&
            r.id === id &&
            r.source === "transcript" &&
            (r.variant ?? "full") === "full",
        );
        if (matches.length !== 1)
          issues.push(`review: missing required ${id} full transcript case`);
      }
    }
    results.push({
      suite,
      cases: rows.length,
      prompts: new Set(rows.filter(object).map((r) => r.promptId)).size,
      judgments,
    });
  }
  return { results, issues };
}
