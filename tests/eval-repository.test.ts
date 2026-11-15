import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRepositoryReviewCases, repositoryReviewPaths } from "../evals/repository-cases";

test("repository AI review covers every application, test, eval and deployment source exactly once", () => {
  const cases = createRepositoryReviewCases();
  const covered = cases.flatMap(item => {
    const payload = item.messages.at(-1)!.content;
    assert.equal(item.payloadSha256, createHash("sha256").update(payload).digest("hex"));
    return (JSON.parse(payload) as {path: string}[]).map(file => file.path);
  });
  assert.deepEqual(covered.sort(), repositoryReviewPaths());
  assert.equal(new Set(covered).size, covered.length);
  for (const path of ["src/App.tsx", "src/GuideLibrary.tsx", "src/PromptDialog.tsx", "src/saved-snapshot.ts", "vite.config.ts", ".github/workflows/pages.yml", "public/recover.html", "evals/live.py"]) assert.ok(covered.includes(path));
  assert.ok(covered.every(path => !/fixtures\/|results\/|\.superpowers\//.test(path)));
});
