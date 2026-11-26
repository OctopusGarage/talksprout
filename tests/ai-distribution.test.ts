import test from "node:test";
import assert from "node:assert/strict";
import { buildDocuments } from "../scripts/ai-content";
import { allPrompts } from "../src/prompts";
import { learningPrompts } from "../src/content/learning";
import { scenes, compatibleScenes } from "../src/scenes";
import { learningPromptText } from "../src/prompt-text";
test("AI content covers every prompt and compatible scenario without changing canonical prompts", () => {
  const before = JSON.stringify(allPrompts);
  const docs = buildDocuments();
  for (const language of ["en"] as const) {
    for (const p of allPrompts)
      for (const variant of ["full", "spoken"] as const)
        assert.ok(
          docs[`${language}/prompts/${p.id}.md`]?.includes(
            promptText(p, variant, "current", language),
          ),
          `${language}/${p.id}/${variant}: complete copied instructions`,
        );
    for (const p of learningPrompts)
      assert.ok(
        docs[`${language}/prompts/${p.id}.md`]?.includes(
          learningPromptText(p, language),
        ),
        `${language}/${p.id}: complete learning instructions`,
      );
    for (const p of allPrompts)
      for (const scene of compatibleScenes(p))
        for (const pace of (p.id === "roleplay-coach" &&
        scene.category === "interview"
          ? ["coached", "mock"]
          : ["coached"]) as ("coached" | "mock")[]) {
          const composed = composeScene(p, {
            sceneId: scene.id,
            pace,
            background: "",
          });
          const path = `${language}/scenarios/${p.id}/${scene.id}${pace === "mock" ? "-mock" : ""}.md`;
          for (const variant of ["full", "spoken"] as const)
            assert.ok(
              docs[path]?.includes(
                promptText(composed, variant, "current", language),
              ),
              `${path}/${variant}: complete composed instructions`,
            );
        }
    for (const scene of scenes)
      assert.ok(
        Object.entries(docs).some(
          ([path, body]) =>
            path.startsWith(`${language}/scenarios/`) &&
            path.endsWith("/index.md") &&
            body.includes(scene.id),
        ),
      );
  }
  assert.equal(JSON.stringify(allPrompts), before);
  assert.deepEqual(buildDocuments(), docs);
});
import { companionArticles } from "../src/content/companion-guides";
import { expandedArticles } from "../src/content/expanded-reading";
import { promptText } from "../src/prompt-text";
import { composeScene } from "../src/scenes";
test("guide bodies, transcript review templates and mock pacing survive distribution", () => {
  const docs = buildDocuments();
  for (const language of ["en"] as const) {
    for (const a of [...companionArticles, ...expandedArticles]) {
      const body = docs[`${language}/guides/${a.id}.md`];
      for (const s of a.sections) {
        for (const p of [...(s.paragraphs ?? []), ...(s.steps ?? [])])
          assert.ok(body.includes(p[language]));
        if (s.prompt) assert.ok(body.includes(s.prompt.body));
      }
    }
    for (const p of allPrompts.filter((p) => p.kind === "review"))
      assert.ok(
        docs[`${language}/prompts/${p.id}.md`].includes(
          promptText(p, "full", "transcript", language),
        ),
      );
    const p = allPrompts.find((p) => p.id === "roleplay-coach")!;
    for (const scene of compatibleScenes(p).filter(
      (s) => s.category === "interview",
    ))
      assert.ok(
        docs[`${language}/scenarios/${p.id}/${scene.id}-mock.md`].includes(
          promptText(
            composeScene(p, {
              sceneId: scene.id,
              pace: "mock",
              background: "",
            }),
            "full",
            "current",
            language,
          ),
        ),
      );
  }
  // Every generated relative Markdown link resolves to a complete bundled document.
  for (const [path, body] of Object.entries(docs).filter(([path]) =>
    path.endsWith("/index.md"),
  ))
    for (const match of body.matchAll(/\]\(([^)]+)\)/g))
      assert.ok(
        docs[path.slice(0, path.lastIndexOf("/") + 1) + match[1]],
        match[1],
      );
});

test("AI entry indexes are bounded and lead through task-specific catalogs", () => {
  const docs = buildDocuments();
  for (const language of ["en"]) {
    assert.ok(docs[`${language}/index.md`].length < 4000);
    for (const group of ["prompts", "scenarios", "guides"])
      assert.ok(docs[`${language}/${group}/index.md`]);
  }
});
