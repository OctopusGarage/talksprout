import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateLearningArchive, type LearningReviewArchive } from "../evals/learning-validate";

test("supplementary editorial archive cannot silently accept changed or missing prompt reviews", () => {
  const archive: LearningReviewArchive = JSON.parse(readFileSync("evals/fixtures/learning-static.json", "utf8"));
  assert.deepEqual(validateLearningArchive(archive), []);
  const stale = structuredClone(archive);
  stale.cases[0].promptSha256 = "outdated";
  assert.match(validateLearningArchive(stale).join(" "), /stale/);
  const missing = structuredClone(archive);
  missing.cases.pop();
  assert.ok(validateLearningArchive(missing).length > 0);
  const duplicate = structuredClone(archive);
  duplicate.cases[0] = duplicate.cases[1];
  assert.ok(validateLearningArchive(duplicate).length > 0);
});
