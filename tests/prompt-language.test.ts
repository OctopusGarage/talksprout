import { test } from "node:test";
import assert from "node:assert/strict";
import { localizePromptInstructions } from "../src/prompt-language";
import { promptText, learningPromptText } from "../src/prompt-text";
import { reviewPrompts } from "../src/prompts";
import { learningPrompts } from "../src/content/learning";
import { composeScene } from "../src/scenes";
import { prompts } from "../src/prompts";

test("English explanations follow the interface while Chinese payloads preserve bytes", () => {
  for (const p of learningPrompts) {
    assert.equal(learningPromptText(p, "zh"), p.prompt);
    assert.doesNotMatch(learningPromptText(p, "en"), /(?:in Chinese|Chinese explanations?|Chinese explanation)/);
  }
  for (const p of reviewPrompts) {
    assert.equal(promptText(p, "full", "current", "zh"), p.prompt);
    const en = promptText(p, "full", "current", "en");
    assert.doesNotMatch(en, /Chinese (?:explanations?|meaning|cue)/);
    assert.notEqual(en, p.prompt);
  }
});
test("language rendering leaves learner background and quoted source data unchanged", () => {
  const p = prompts.find((p) => p.id === "roleplay-coach")!;
  const background = "My draft literally says Chinese explanations. Do not translate this fact.";
  const composed = composeScene(p, { sceneId: "work-04", pace: "coached", background });
  assert.ok(promptText(composed, "full", "current", "en").includes(JSON.stringify(background)));
  assert.equal(localizePromptInstructions("plain text", "en"), "plain text");
});
