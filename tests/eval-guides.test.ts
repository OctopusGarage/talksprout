import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { handbookArticles } from "../src/content/guides";
import { createGuideInteractionCases, createGuideReviewCases } from "../evals/guide-cases";

test("guide interactions execute every exact copyable prompt with genuine multi-turn history", () => {
  const prompts = handbookArticles.flatMap(article => article.sections.flatMap(section => section.prompt ? [section.prompt] : []));
  const cases = createGuideInteractionCases();
  assert.equal(cases.length, 7);
  assert.deepEqual(cases.map(item => item.promptId).sort(), prompts.map(prompt => prompt.id).sort());
  for (const item of cases) {
    const prompt = prompts.find(prompt => prompt.id === item.promptId)!;
    assert.equal(item.messages.length, 1);
    assert.equal(item.messages[0].content, prompt.body);
    assert.equal(item.messages[0].role, item.promptId.startsWith("global-") ? "system" : "user");
    assert.equal(item.payloadSha256, createHash("sha256").update(prompt.body).digest("hex"));
    assert.equal(item.turns?.length, 5);
    assert.ok(item.turns?.every(turn => turn.input && turn.criterion));
  }
});

test("guide AI review covers every whole bilingual article and all runtime change areas", () => {
  const cases = createGuideReviewCases();
  const readings = cases.filter(item => item.purpose === "guide-content-review");
  assert.deepEqual(readings.map(item => item.promptId).sort(), handbookArticles.map(article => article.id).sort());
  for (const item of readings) {
    const article = handbookArticles.find(article => article.id === item.promptId)!;
    assert.ok(item.messages.at(-1)?.content.includes(JSON.stringify(article)));
  }
  for (const id of ["reader-copy", "app-routing", "content-assembly", "tests-scripts", "documentation"]) {
    assert.ok(cases.some(item => item.id === `guide-code-${id}`));
  }
});

import { readFileSync } from "node:fs";
import { createGuideRegressionCases } from "../evals/guide-cases";
import { validateLiveArchive } from "../evals/live-validate";
import { validateGuideObservations } from "../evals/guide-evidence";

test("accepted guide evidence is bound to current prompts, whole articles and reviewed source files", () => {
  const sessions = JSON.parse(readFileSync("evals/fixtures/guide-sessions-live-api.json", "utf8"));
  const reviews = JSON.parse(readFileSync("evals/fixtures/guide-review-live-api.json", "utf8"));
  assert.deepEqual(validateLiveArchive(sessions, createGuideInteractionCases()).issues, []);
  assert.deepEqual(validateLiveArchive(reviews, createGuideReviewCases()).issues, []);
  const stale = structuredClone(sessions);
  stale.cases[0].turnResults[0].target.content = "Changed reply";
  assert.ok(validateLiveArchive(stale, createGuideInteractionCases()).issues.length > 0);
});

test("observed judge conflicts remain non-accepted failures with checked evidence", () => {
  const archive = JSON.parse(readFileSync("evals/results/2026-11-15-guide-regression-rejudged.json", "utf8"));
  const result = validateGuideObservations(archive, createGuideRegressionCases());
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.summary, { pass: 0, fail: 2, uncertain: 0 });
  assert.equal(result.accepted, false);
  const broken = structuredClone(archive);
  broken.cases[0].turnResults.pop();
  assert.ok(validateGuideObservations(broken, createGuideRegressionCases()).issues.length > 0);
});
