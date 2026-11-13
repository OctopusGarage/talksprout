import { test } from "node:test";
import assert from "node:assert/strict";
import { prompts } from "../src/prompts";
test("library is a small set of distinct conversation starters", () => {
  assert.equal(prompts.length, 9);
  const kept = [
    "daily-check-in",
    "gentle-start",
    "focused-correction",
    "expression-upgrade",
    "roleplay-coach",
    "friendly-debate",
    "story-summary",
    "visual-vocabulary",
    "word-riddle",
  ];
  assert.deepEqual(new Set(prompts.map((p) => p.id)), new Set(kept));
  for (const id of [
    "conversation-expression-review",
    "long-sentence-reading",
    "shadowing-companion",
    "symbols-out-loud",
    "spoken-diary",
    "football-fan-chat",
    "low-energy-practice",
  ])
    assert.ok(!prompts.some((p) => p.id === id));
});
