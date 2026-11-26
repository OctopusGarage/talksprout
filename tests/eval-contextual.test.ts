import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateContextualArchive,
  validateContextualTarget,
} from "../evals/contextual-evidence";
test("contextual navigation archives bind twelve genuine native histories and same-model assessments", () => {
  const checked = validateContextualArchive();
  assert.deepEqual(checked.issues, []);
  assert.equal(checked.sessions, 12);
  assert.equal(checked.targetTurns, 40);
  for (const route of checked.outcomes) {
    assert.equal(route.assessments.length, 6);
    assert.ok(route.assessments.every((a: any) => a.verdict === "pass"));
  }
});
test("contextual provenance rejects changed requests, extra native user input, missing usage and false thread continuity", () => {
  const original = JSON.parse(
    readFileSync(
      "evals/results/contextual-0.1.5/active--skill-web.json",
      "utf8",
    ),
  );
  for (const change of [
    (r: any) => (r.turns[0].request += "changed"),
    (r: any) =>
      r.turns[1].nativeTrace.push({
        type: "assistant_message",
        text: "Authored assistant seed",
      }),
    (r: any) =>
      r.turns[1].nativeTrace.push({ type: "user_message", text: "extra" }),
    (r: any) =>
      (r.turns[1].events = r.turns[1].events.filter(
        (e: any) => e.type !== "turn.completed",
      )),
    (r: any) => (r.turns[2].threadId = "unrelated"),
  ]) {
    const altered = structuredClone(original);
    change(altered);
    assert.ok(validateContextualTarget(altered, "active", "skill-web").length);
  }
});
