import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateLiveArchive,
  validateCompositionMatrix,
} from "../evals/live-validate";
import { recordedSceneIds } from "../evals/live-coverage";
import { createLiveCases } from "../evals/live-cases";
import { scenes } from "../src/scenes";
import { evidenceDigest } from "../evals/validate";
const archive = () =>
  JSON.parse(readFileSync("evals/fixtures/live-api.json", "utf8"));
test("recorded live executions and all composed payloads satisfy release coverage", () => {
  const live = validateLiveArchive(archive());
  assert.deepEqual(live.issues, []);
  assert.equal(live.cases, 562);
  assert.equal(live.adjudications, 1);
  const matrix = validateCompositionMatrix();
  assert.equal(matrix.combinations, 936);
  assert.equal(matrix.payloads, 1872);
  assert.deepEqual(matrix.issues, []);
});
test("a resealed response, missing case, or changed source cannot silently satisfy live evidence", () => {
  const changed = archive();
  changed.cases[0].target.content = "Changed response";
  assert.ok(
    validateLiveArchive(changed).issues.some((s) =>
      s.includes("stale live evidence"),
    ),
  );
  const missing = archive();
  missing.cases.pop();
  assert.ok(
    validateLiveArchive(missing).issues.some((s) => s.includes("missing")),
  );
  const input = archive();
  input.cases[0].case.messages[0].content += " Changed input";
  input.cases[0].evidenceSha256 = evidenceDigest(input.cases[0]);
  assert.ok(
    validateLiveArchive(input).issues.some((s) =>
      s.includes("stale or unexpected live input"),
    ),
  );
});
test("live validation rejects stale grading policy and missing API execution provenance", () => {
  const policy = archive();
  policy.judgePolicySha256 = "0".repeat(64);
  assert.ok(
    validateLiveArchive(policy).issues.some((s) =>
      s.includes("stale judge policy"),
    ),
  );
  const provenance = archive();
  delete provenance.cases[0].target.responseId;
  provenance.cases[0].evidenceSha256 = evidenceDigest(provenance.cases[0]);
  assert.ok(
    validateLiveArchive(provenance).issues.some((s) =>
      s.includes("real target execution"),
    ),
  );
});
test("semantic adjudication remains bound to raw target, input and judge records", () => {
  const tampered = archive();
  // A synthetic adjudication tests binding even when the release needs none.
  const row = tampered.cases[0];
  row.adjudication = {
    id: row.case.id,
    reviewer: "codex-semantic-review",
    judgment: "pass",
    releaseBlocking: false,
    reason: "Synthetic test review of the exact observed input, reply and original judge evidence.",
    rawJudge: { ...row.judge },
    observedReply: row.target.content,
    payloadSha256: row.case.payloadSha256,
    rawEvidenceSha256: evidenceDigest(row),
  };
  tampered.adjudications += 1;
  row.evidenceSha256 = evidenceDigest(row);
  assert.deepEqual(validateLiveArchive(tampered).issues, []);
  row.adjudication.observedReply = "Different reply";
  row.evidenceSha256 = evidenceDigest(row);
  assert.ok(
    validateLiveArchive(tampered).issues.some((s) =>
      s.includes("adjudication does not match"),
    ),
  );
  const counts = archive();
  counts.rawJudgeSummary.pass++;
  assert.ok(
    validateLiveArchive(counts).issues.some((s) =>
      s.includes("raw judge summary"),
    ),
  );
});

test("live coverage keeps the recorded scope fixed and reports new scenes as pending", () => {
  const live = validateLiveArchive(archive());
  assert.equal(recordedSceneIds.length, 160);
  assert.equal(new Set(recordedSceneIds).size, 160);
  assert.ok(Object.isFrozen(recordedSceneIds));
  assert.ok(recordedSceneIds.every((id) => scenes.some((scene) => scene.id === id)));
  assert.equal(live.recordedScenes, 160);
  assert.equal(live.pendingScenes, 0);
  assert.deepEqual(
    live.pendingSceneIds,
    scenes.filter((scene) => !recordedSceneIds.includes(scene.id)).map((scene) => scene.id),
  );
  const currentCases = createLiveCases();
  assert.equal(currentCases.length, 562);
  assert.equal(
    currentCases.filter((item) => item.selection && live.pendingSceneIds.includes(item.selection.sceneId)).length,
    0,
  );
  assert.deepEqual(live.issues, []);
});

test("removing a whole recorded scene cannot shrink the required live scope", () => {
  const missing = archive();
  const sceneId = recordedSceneIds[0];
  missing.cases = missing.cases.filter(
    (row: { case: { selection?: { sceneId: string } } }) => row.case.selection?.sceneId !== sceneId,
  );
  // Match aggregate counts to the shortened archive: scope must still reject it.
  missing.summary.pass = missing.cases.length;
  missing.rawJudgeSummary = { pass: 0, fail: 0, uncertain: 0 };
  for (const row of missing.cases) missing.rawJudgeSummary[row.judge.judgment]++;
  const issues = validateLiveArchive(missing).issues;
  assert.ok(issues.some((issue) => issue.startsWith("live: missing ") && issue.includes(`-full-${sceneId}-`)));
  assert.ok(issues.some((issue) => issue.startsWith("live: missing ") && issue.includes(`-spoken-${sceneId}-`)));
});

test("future catalog additions remain pending without weakening recorded coverage", () => {
  const before = validateLiveArchive(archive());
  const template = scenes.find((scene) => scene.category === "services")!;
  const probeId = "future-scene-probe";
  scenes.push({ ...template, id: probeId });
  try {
    const expanded = validateLiveArchive(archive());
    assert.equal(expanded.recordedScenes, before.recordedScenes);
    assert.equal(expanded.pendingScenes, before.pendingScenes + 1);
    assert.ok(expanded.pendingSceneIds.includes(probeId));
    assert.deepEqual(expanded.issues, []);
  } finally {
    assert.equal(scenes.pop()?.id, probeId);
  }
});


test("sealed judge records cannot reuse one execution across isolated cases", () => {
  const reused = archive();
  reused.cases[1].judgeExecution.responseId = reused.cases[0].judgeExecution.responseId;
  reused.cases[1].evidenceSha256 = evidenceDigest(reused.cases[1]);
  assert.ok(validateLiveArchive(reused).issues.some((issue) => issue.includes("must be isolated to one case")));
});
