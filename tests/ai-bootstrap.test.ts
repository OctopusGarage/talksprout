import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSkillBootstrap } from "../scripts/ai-bootstrap";
import { buildDocuments } from "../scripts/ai-content";
import guidance from "../distribution/guidance.json";
test("installed Skill is a small latest-entry bootstrap, not a frozen lesson workflow", () => {
  const skill = buildSkillBootstrap();
  assert.equal(skill, readFileSync("skills/talksprout/SKILL.md", "utf8"));
  assert.ok(skill.length < 2400);
  for (const language of ["en"])
    assert.ok(skill.includes(`/main/content/${language}/start.md`));
  assert.ok(!skill.includes(guidance.instructions));
  assert.doesNotMatch(
    skill,
    /First ask the missing goal|mock interview documents|release-pinned|Choose the workflow/,
  );
});
test("remote rule updates change only entry documents while the installed bootstrap stays identical", () => {
  const original = buildDocuments();
  const changed = buildDocuments({
    instructions: guidance.instructions + "\nA future remote learning rule.",
  });
  assert.deepEqual(
    Object.keys(original)
      .filter((path) => original[path] !== changed[path])
      .sort(),
    ["en/start.md"],
  );
  for (const language of ["en"]) {
    assert.ok(original[`${language}/start.md`].includes(guidance.instructions));
    assert.ok(original[`${language}/index.md`].includes("(start.md)"));
    for (const path of [
      "prompts/index.md",
      "scenarios/index.md",
      "guides/index.md",
    ])
      assert.ok(original[`${language}/start.md`].includes(`(${path})`));
  }
  assert.equal(
    buildSkillBootstrap(),
    readFileSync("skills/talksprout/SKILL.md", "utf8"),
  );
});

test("fallback identifies the same concrete English remote entry", () => {
  const skill = buildSkillBootstrap();
  for (const language of ["en"])
    assert.ok(
      skill.includes(
        `https://github.com/OctopusGarage/talksprout/blob/main/content/${language}/start.md`,
      ),
    );
});

test("bootstrap states stable routing and retrieval contracts without incident-specific language", () => {
  const skill = buildSkillBootstrap();
  assert.match(skill, /loading it does not start or reset a lesson/);
  assert.match(skill, /A bare invocation requests contextual options/);
  assert.match(skill, /an explicit task takes precedence/);
  assert.match(skill, /link-opening, browsing, fetch or full-page reading/);
  assert.match(skill, /Search snippets alone are not a loaded document/);
  assert.match(skill, /provide the complete entry link/);
  assert.match(skill, /ordinary English practice separate and opt-in/);
  assert.doesNotMatch(
    skill,
    /Gem|no tool is named|talksprout start conversation|Do not require creating/,
  );
});

test("the old Chinese entry is only an English compatibility pointer", () => {
  const pointer = readFileSync("content/zh/start.md", "utf8");
  assert.ok(pointer.includes("../en/start.md"));
  assert.ok(pointer.length < 400);
  assert.doesNotMatch(pointer, /[\u4e00-\u9fff]/);
  assert.ok(
    Object.keys(buildDocuments()).every((path) => path.startsWith("en/")),
  );
});
