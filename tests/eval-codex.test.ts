import { validateCodexStatus } from "../evals/codex-status";
import test from "node:test";
import assert from "node:assert/strict";
import { validateCodexArchive } from "../evals/codex-validate";
test("Codex evidence rejects absent, incomplete, and API-disguised executions", () => {
  assert.ok(validateCodexArchive({}, []).issues.length);
  assert.ok(
    validateCodexArchive(
      { method: "live-openai-chat-completions", cases: [] },
      [],
    ).issues.length,
  );
  assert.ok(
    validateCodexArchive({ method: "codex-cli-source-review", cases: [{}] }, [])
      .issues.length,
  );
});

import { readFileSync } from "node:fs";
import { createCodexReviewCases } from "../evals/codex-cases";
import { evidenceDigest } from "../evals/validate";
test("accepted Codex evidence binds every source case and genuine isolated execution", () => {
  const archive = JSON.parse(
    readFileSync("evals/fixtures/codex-source-reviews.json", "utf8"),
  );
  const expected = createCodexReviewCases();
  assert.deepEqual(validateCodexArchive(archive, expected).issues, []);
  assert.equal(archive.cases.length, expected.length);
  assert.deepEqual(
    validateCodexStatus(
      JSON.parse(
        readFileSync("evals/fixtures/codex-review-status.json", "utf8"),
      ),
      archive,
      expected,
    ),
    [],
  );
  const stale = structuredClone(archive);
  stale.cases[0].case.messages[0].content += "modified";
  assert.ok(
    validateCodexArchive(stale, expected).issues.some((i) =>
      i.includes("stale"),
    ),
  );
  const tampered = structuredClone(archive);
  tampered.cases[0].target.output.assessment = "revise";
  assert.ok(
    validateCodexArchive(tampered, expected).issues.some((i) =>
      i.includes("tampered"),
    ),
  );
  const missing = structuredClone(archive);
  missing.cases.pop();
  assert.ok(
    validateCodexArchive(missing, expected).issues.some((i) =>
      i.includes("missing Codex"),
    ),
  );
  const fake = structuredClone(archive);
  fake.cases[0].target.events = [];
  fake.cases[0].evidenceSha256 = evidenceDigest(fake.cases[0]);
  assert.ok(
    validateCodexArchive(fake, expected).issues.some((i) =>
      i.includes("thread"),
    ),
  );
  const wrongRequest = structuredClone(archive);
  wrongRequest.cases[0].target.requestSha256 = "a".repeat(64);
  wrongRequest.cases[0].evidenceSha256 = evidenceDigest(wrongRequest.cases[0]);
  assert.ok(
    validateCodexArchive(wrongRequest, expected).issues.some((i) =>
      i.includes("exact source"),
    ),
  );
  const bad = structuredClone(archive);
  bad.cases[0].judge.output.judgment = "fail";
  bad.cases[0].evidenceSha256 = evidenceDigest(bad.cases[0]);
  assert.ok(
    validateCodexArchive(bad, expected).issues.some((i) => i.includes("judge")),
  );
});

for (const [filename, expectedIssues] of [
  ["2026-11-25-codex-source-review-before-mcp-release-fixes.json", 4],
  ["2026-11-25-codex-source-review-before-resume-tag-fixes.json", 4],
  ["2026-11-25-codex-source-review-before-release-invalidation-fix.json", 3],
  ["2026-11-25-codex-source-review-before-invocation-lock-fix.json", 2],
] as const)
  test(`historical Codex findings remain non-accepted: ${filename}`, () => {
    const observed = JSON.parse(
      readFileSync(`evals/results/${filename}`, "utf8"),
    );
    const checked = validateCodexArchive(
      observed,
      observed.cases.map(
        (row: { case: import("../evals/live-cases").LiveCase }) => row.case,
      ),
    );
    assert.equal(observed.cases.length, 10);
    assert.equal(checked.issues.length, expectedIssues);
    assert.ok(
      checked.issues.every(
        (issue) =>
          issue.endsWith("source review has unresolved findings") ||
          issue.endsWith("independent judge did not accept source"),
      ),
    );
    assert.ok(
      observed.cases.some(
        (row: { target: { output: { findings: unknown[] } } }) =>
          row.target.output.findings.length > 0,
      ),
    );
  });

test("previous 0.1.0 accepted Codex executions retain their original source and provenance", () => {
  const historical = JSON.parse(
    readFileSync(
      "evals/results/2026-11-25-codex-source-reviews-ai-v0.1.0.json",
      "utf8",
    ),
  );
  const originalCases = historical.cases.map(
    (row: { case: import("../evals/live-cases").LiveCase }) => row.case,
  );
  assert.deepEqual(validateCodexArchive(historical, originalCases).issues, []);
  assert.equal(historical.cases.length, 10);
});

test("previous 0.1.1 accepted Codex executions retain their original source and provenance", () => {
  const historical = JSON.parse(
    readFileSync(
      "evals/results/2026-11-26-codex-source-reviews-ai-v0.1.1.json",
      "utf8",
    ),
  );
  const originalCases = historical.cases.map(
    (row: { case: import("../evals/live-cases").LiveCase }) => row.case,
  );
  assert.deepEqual(validateCodexArchive(historical, originalCases).issues, []);
  assert.equal(historical.cases.length, 10);
});
