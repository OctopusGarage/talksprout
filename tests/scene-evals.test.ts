import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  scenePayloadDigest,
  validateSceneArchive,
} from "../evals/scene-validate";
import { evidenceDigest } from "../evals/validate";
const archive = () =>
  JSON.parse(readFileSync("evals/fixtures/scene-presets.json", "utf8"));
test("scene archive checks composed payloads and authored evidence", () => {
  assert.deepEqual(validateSceneArchive(archive()), []);
  const changed = archive();
  changed.cases[0].selection.background = "New facts";
  changed.cases[0].evidenceSha256 = evidenceDigest(changed.cases[0]);
  assert.ok(
    validateSceneArchive(changed).some((s) => s.includes("stale payload")),
  );
  const output = archive();
  output.cases[0].turns[0].content = "Changed output";
  assert.ok(
    validateSceneArchive(output).some((s) => s.includes("stale evidence")),
  );
});
test("sealing incomplete cases cannot replace scene coverage or learner turns", () => {
  const missing = archive();
  missing.cases = missing.cases.filter(
    (r: { id: string }) => r.id !== "tennis-spoken",
  );
  assert.ok(
    validateSceneArchive(missing).some((s) =>
      s.includes("missing tennis/spoken"),
    ),
  );
  const edge = archive();
  const retry = edge.cases.find(
    (r: { purpose: string }) => r.purpose === "retry",
  );
  retry.turns = [retry.turns[0]];
  retry.evidenceSha256 = evidenceDigest(retry);
  assert.ok(
    validateSceneArchive(edge).some((s) => s.includes("needs learner turns")),
  );
});

test("edge coverage cannot be substituted with unrelated scenes or pacing", () => {
  const changed = archive();
  const row = changed.cases.find(
    (r: { purpose: string }) => r.purpose === "mock-review",
  );
  row.selection.pace = "coached";
  row.payloadSha256 = scenePayloadDigest(
    row.promptId,
    row.variant,
    row.selection,
  );
  row.evidenceSha256 = evidenceDigest(row);
  assert.ok(
    validateSceneArchive(changed).some((s) =>
      s.includes("mock-review contract"),
    ),
  );
});
test("unknown purposes and nonalternating dialogues are rejected even when sealed", () => {
  const purpose = archive();
  purpose.cases[0].purpose = "unrecognized";
  purpose.cases[0].evidenceSha256 = evidenceDigest(purpose.cases[0]);
  assert.ok(
    validateSceneArchive(purpose).some((s) => s.includes("unknown purpose")),
  );
  const turns = archive();
  const row = turns.cases.find(
    (r: { purpose: string }) => r.purpose === "retry",
  );
  row.turns[1].role = "assistant";
  row.evidenceSha256 = evidenceDigest(row);
  assert.ok(validateSceneArchive(turns).some((s) => s.includes("alternate")));
});


test("new service, travel and social scenes require authored coverage in both formats", () => {
  for (const sceneId of ["return-item", "lost-baggage", "decline-invitation"]) {
    const missing = archive();
    missing.cases = missing.cases.filter(
      (row: { selection: { sceneId: string }; variant: string }) =>
        row.selection.sceneId !== sceneId || row.variant !== "spoken",
    );
    assert.ok(validateSceneArchive(missing).some((issue) => issue.includes(`missing ${sceneId}/spoken`)));
  }
});
