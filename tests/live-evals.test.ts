import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateLiveArchive,
  validateCompositionMatrix,
} from "../evals/live-validate";
import { evidenceDigest } from "../evals/validate";
const archive = () =>
  JSON.parse(readFileSync("evals/fixtures/live-api.json", "utf8"));
test("recorded live executions and all composed payloads satisfy release coverage", () => {
  const live = validateLiveArchive(archive());
  assert.deepEqual(live.issues, []);
  assert.equal(live.cases, 514);
  assert.equal(live.adjudications, 1);
  const matrix = validateCompositionMatrix();
  assert.equal(matrix.combinations, 800);
  assert.equal(matrix.payloads, 1600);
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
  const row = tampered.cases.find(
    (r: { adjudication?: unknown }) => r.adjudication,
  );
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
