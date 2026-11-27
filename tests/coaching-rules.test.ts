import { test } from "node:test";
import assert from "node:assert/strict";
import { companions } from "../src/content/companions.ts";
import { interaction } from "../src/content/interaction.ts";
import { materials } from "../src/content/materials.ts";
import { learningPrompts } from "../src/content/learning.ts";
import { conversationRepairRules } from "../src/content/learning-rules.ts";
import { coachingRules } from "../src/content/coaching-rules.ts";

test("every coach includes the complete shared contract exactly once", () => {
  for (const coach of [...companions, ...interaction, ...materials]) {
    assert.equal(coach.prompt.split(coachingRules).length, 2, coach.id);
  }
});

test("learning helpers include shared interaction support exactly once", () => {
  for (const helper of learningPrompts) {
    assert.equal(helper.prompt.split(conversationRepairRules).length, 2, helper.id);
  }
});
