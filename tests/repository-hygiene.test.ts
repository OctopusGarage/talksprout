import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { repositoryHygieneIssues } from "../scripts/repository-hygiene";

test("repository excludes temporary artifacts and retired tooling", () => {
  const paths = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "utf8" },
  )
    .split("\0")
    .filter((path) => path && existsSync(path));
  assert.deepEqual(repositoryHygieneIssues(paths), []);
});
test("forced artifacts are rejected while product sources stay allowed", () => {
  for (const path of [
    "evals/results/run.json",
    "docs/research/notes.md",
    "docs/usability/session.csv",
    ".superpowers/run.json",
    "public/downloads/package.zip",
    "mcp/generated/library.json",
    "debug.log",
    "scripts/task.pyc",
  ]) {
    assert.equal(repositoryHygieneIssues([path]).length, 1);
  }
  assert.deepEqual(
    repositoryHygieneIssues([
      "src/App.tsx",
      "content/en/start.md",
      "scripts/package-check.py",
    ]),
    [],
  );
});
