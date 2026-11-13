import { test } from "node:test";
import assert from "node:assert/strict";
import { allPrompts, prompts, reviewPrompts } from "../src/prompts";
import { promptText } from "../src/prompt-text";
import { filterPrompts } from "../src/library";

test("review content is distinct from the nine conversation starters", () => {
  assert.equal(prompts.length, 9);
  assert.equal(reviewPrompts.length, 4);
  assert.equal(new Set(allPrompts.map((p) => p.id)).size, 13);
  assert.equal(
    allPrompts.filter((p) => p.kind !== "review").length,
    prompts.length,
  );
  assert.ok(
    reviewPrompts.every(
      (p) => p.kind === "review" && p.category === "结束与复习",
    ),
  );
  assert.equal(reviewPrompts.filter((p) => p.recommended).length, 1);
  assert.deepEqual(
    filterPrompts(allPrompts, { query: "IPA", category: "结束与复习" }).map(
      (p) => p.id,
    ),
    ["vocabulary-ipa-review"],
  );
  for (const p of reviewPrompts) {
    assert.ok(p.spokenPrompt.trim().split(/\s+/).length <= 85, p.id);
    assert.ok(!/[\u4e00-\u9fff]/.test(p.spokenPrompt), p.id);
  }
});

test("transcript source changes only full review instructions", () => {
  for (const p of reviewPrompts) {
    assert.equal(promptText(p), p.prompt);
    const template = promptText(p, "full", "transcript");
    assert.ok(template.startsWith(p.prompt));
    assert.match(
      template,
      /use only the transcript enclosed below, not the surrounding chat/,
    );
    assert.ok(
      template.endsWith(
        "<transcript>\n[Paste the conversation here, including speaker labels]\n</transcript>",
      ),
    );
    assert.equal(promptText(p, "spoken", "transcript"), p.spokenPrompt);
  }
  for (const p of prompts) {
    assert.equal(promptText(p, "full", "transcript"), p.prompt);
    assert.equal(promptText(p, "spoken", "transcript"), p.spokenPrompt);
  }
});
