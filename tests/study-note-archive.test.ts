import test from "node:test";
import assert from "node:assert/strict";
import { buildDocuments } from "../scripts/ai-content";
import { buildFullSkill } from "../scripts/ai-full-skill";
import { buildSkillBootstrap } from "../scripts/ai-bootstrap";
import { reviewPrompts } from "../src/prompts";
import {
  buildStudyNoteArchiveGuide,
  studyMaterialArchiveExample,
  studyMaterialNames,
} from "../src/content/study-note-archive";

test("shared archive guide reaches the English feed and the self-contained Skill", () => {
  const docs = buildDocuments(),
    full = buildFullSkill();
  for (const locale of ["en"] as const) {
    assert.equal(docs[`${locale}/notes.md`], buildStudyNoteArchiveGuide());
    assert.ok(docs[`${locale}/start.md`].includes("](notes.md)"));
    assert.ok(docs[`${locale}/index.md`].includes("](notes.md)"));
    assert.ok(full.includes(docs[`${locale}/notes.md`]));
  }
  assert.ok(buildSkillBootstrap().length < 2400);
});

test("all four review kinds have stable bilingual archival labels and matching examples", () => {
  assert.deepEqual(
    studyMaterialNames.map((item) => item.id).sort(),
    reviewPrompts.map((p) => p.id).sort(),
  );
  for (const locale of ["zh", "en"] as const)
    for (const item of studyMaterialNames) {
      const title = studyMaterialArchiveExample(locale, item.id);
      assert.ok(title.endsWith(" - " + item[locale]));
      if (locale === "en")
        assert.ok(buildStudyNoteArchiveGuide().includes(title));
      assert.doesNotMatch(title, /[\\/:*?"<>|\n\r]/);
    }
});
