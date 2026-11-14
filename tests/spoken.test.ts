import { test } from "node:test";
import assert from "node:assert/strict";
import { prompts } from "../src/prompts";
test("each coach has a short standalone English script for speaking aloud", () => {
  for (const p of prompts) {
    const text = p.spokenPrompt;
    assert.ok(text, `${p.id}: missing spoken opening`);
    assert.ok(text.trim().split(/\s+/).length <= 85, p.id);
    assert.ok(!/[\u4e00-\u9fff]/.test(text), p.id);
    assert.ok(!text.includes("/"), p.id);
    assert.match(text, /short|brief/i, p.id);
    assert.match(text, /one (?:easy )?question|one follow-up/i, p.id);
    assert.match(
      text,
      /correct|model|feedback|rewrite|fix a real issue/i,
      p.id,
    );
    assert.match(text, /start|ask|clue/i, p.id);
  }
});
