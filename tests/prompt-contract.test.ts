import { test } from "node:test";
import assert from "node:assert/strict";
import { prompts } from "../src/prompts.ts";
test("every exported prompt has a real instruction, valid level and numeric duration", () => {
  for (const p of prompts) {
    assert.match(p.level, /^A[12]–[AB][12]$|^B[12]–B[12]$/, p.id);
    assert.match(p.minutes, /^\d+–\d+$/, p.id);
    assert.ok(p.prompt.length > 250, `${p.id} must copy an actual full prompt`);
    assert.match(p.prompt, /Start /, p.id);
  }
});

test("every prompt exposes consistent session controls and localized usage metadata", () => {
  for (const p of prompts) {
    for (const field of [
      "descriptionEn",
      "guideEn",
      "feedbackEn",
      "requiresEn",
    ] as const)
      assert.ok(p[field].length > 0, `${p.id} ${field}`);
    for (const command of ["help", "review", "finish"] as const) {
      assert.ok(p.commands[command], p.id);
      assert.ok(p.prompt.includes(`"${command}"`), p.id);
    }
    assert.match(p.prompt, /counts are maximums/, p.id);
    assert.match(p.prompt, /not when they appear inside/, p.id);
    assert.match(p.prompt, /no new question/, p.id);
  }
});
test("all coaches are ongoing coaching rather than batch tools", () => {
  for (const p of prompts) {
    assert.match(p.prompt, /correct|feedback|model/i, p.id);
    assert.match(p.prompt, /conversation|question|round|follow-up/i, p.id);
    assert.equal(p.mode, "both");
  }
  assert.ok(
    prompts
      .find((p) => p.id === "daily-check-in")!
      .prompt.includes("After each answer"),
  );
  assert.ok(
    prompts
      .find((p) => p.id === "focused-correction")!
      .prompt.includes("During the retry"),
  );
  assert.ok(
    prompts
      .find((p) => p.id === "word-riddle")!
      .prompt.includes("Only then offer the next round"),
  );
});
