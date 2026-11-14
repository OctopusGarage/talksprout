import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createLiveCases } from "../evals/live-cases";
import { prompts, reviewPrompts } from "../src/prompts";
import { scenes, composeScene } from "../src/scenes";
import { promptText } from "../src/prompt-text";

test("live suite covers every scene and both formats without changing copied payloads", () => {
  const cases = createLiveCases();
  assert.equal(cases.length, new Set(cases.map((c) => c.id)).size);
  for (const scene of scenes)
    for (const variant of ["full", "spoken"]) {
      assert.ok(
        cases.some(
          (c) =>
            c.purpose === "scene-opening" &&
            c.selection?.sceneId === scene.id &&
            c.variant === variant,
        ),
      );
      if (scene.category === "interview")
        assert.ok(
          cases.some(
            (c) =>
              c.purpose === "mock-opening" &&
              c.selection?.sceneId === scene.id &&
              c.variant === variant &&
              c.selection.pace === "mock",
          ),
        );
    }
  for (const c of cases) {
    const p = [...prompts, ...reviewPrompts].find((p) => p.id === c.promptId)!;
    const payload = promptText(
      composeScene(p, c.selection),
      c.variant,
      c.source,
    );
    assert.equal(
      c.payloadSha256,
      createHash("sha256").update(payload).digest("hex"),
    );
    assert.ok(
      c.messages.every(
        (m) => ["user", "assistant"].includes(m.role) && m.content.trim(),
      ),
    );
    assert.ok(c.criterion.trim());
  }
});
test("live suite covers all coaches, review sources and retry detours", () => {
  const cases = createLiveCases();
  for (const p of prompts)
    for (const variant of ["full", "spoken"])
      for (const purpose of [
        "base-opening",
        "natural-answer",
        "help-before-attempt",
        "stop",
      ])
        assert.ok(
          cases.some(
            (c) =>
              c.promptId === p.id &&
              c.variant === variant &&
              c.purpose === purpose,
          ),
        );
  for (const p of reviewPrompts)
    for (const purpose of [
      "review-current",
      "review-missing",
      "voice-only-text-fallback",
      "review-transcript-isolation",
      "review-transcript-missing",
    ])
      assert.ok(
        cases.some((c) => c.promptId === p.id && c.purpose === purpose),
      );
  for (const c of cases.filter(
    (c) => c.purpose === "review-transcript-isolation",
  )) {
    assert.ok(c.messages.at(-1)!.content.includes("Learner: I live in Kyoto."));
    assert.ok(!c.messages.at(-1)!.content.includes("[Paste the conversation"));
  }
});
