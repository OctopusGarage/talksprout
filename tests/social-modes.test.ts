import test from "node:test";
import assert from "node:assert/strict";
import { allPrompts } from "../src/prompts";
import { socialPrompts } from "../src/content/social";
import { compatibleScenes } from "../src/scenes";

test("reciprocal modes avoid the question-driven scenario composer", () => {
  for (const p of socialPrompts) {
    assert.deepEqual(compatibleScenes(p), []);
    assert.ok(allPrompts.includes(p));
    assert.ok(p.spokenPrompt.split(/\s+/).length <= 85, p.id);
  }
});
