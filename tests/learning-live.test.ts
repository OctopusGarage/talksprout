import { test } from "node:test";
import assert from "node:assert/strict";
import { createLearningLiveCases } from "../evals/learning-live-cases";
import { learningPrompts } from "../src/content/learning";

test("learning live cases cover every prompt with sources, missing material, help, stopping and injection", () => {
  const cases = createLearningLiveCases();
  assert.equal(new Set(cases.map((c) => c.id)).size, cases.length);
  for (const prompt of learningPrompts) {
    const own = cases.filter((c) => c.promptId === prompt.id);
    for (const purpose of ["learning-start", "learning-material", "learning-help", "learning-stop", "learning-injection", "learning-follow-up"])
      assert.ok(own.some((c) => c.purpose === purpose), `${prompt.id}: ${purpose}`);
    assert.ok(own.every((c) => c.messages[0].content === prompt.prompt));
    assert.ok(own.every((c) => c.criterion.trim() && c.maxTokens >= 700));
  }
});

test("learning live archive rejects missing, stale and ungrounded execution evidence", async () => {
  const { readFileSync } = await import("node:fs");
  const { validateLiveArchive } = await import("../evals/live-validate");
  const { evidenceDigest } = await import("../evals/validate");
  const archive = () => JSON.parse(readFileSync("evals/fixtures/learning-live-api.json", "utf8"));
  const expected = createLearningLiveCases();
  assert.equal(expected.length, 108);
  assert.deepEqual(validateLiveArchive(archive(), expected).issues, []);
  const missing = archive();
  missing.cases.pop();
  assert.ok(validateLiveArchive(missing, expected).issues.some((s) => s.includes("live: missing")));
  const stale = archive();
  stale.cases[0].case.messages[0].content += " changed prompt";
  stale.cases[0].evidenceSha256 = evidenceDigest(stale.cases[0]);
  assert.ok(validateLiveArchive(stale, expected).issues.some((s) => s.includes("stale or unexpected live input")));
  const execution = archive();
  delete execution.cases[0].target.responseId;
  execution.cases[0].evidenceSha256 = evidenceDigest(execution.cases[0]);
  assert.ok(validateLiveArchive(execution, expected).issues.some((s) => s.includes("real target execution")));
});
