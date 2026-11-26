import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildFullSkill, fullSkillScene } from "../scripts/ai-full-skill";
import { buildDocuments } from "../scripts/ai-content";
import { allPrompts } from "../src/prompts";
import { learningPrompts } from "../src/content/learning";
import {
  scenes,
  compatibleScenes,
  composeScene,
  composeSceneContent,
} from "../src/scenes";

test("full Skill contains every task, scenario and complete English guide", () => {
  const full = buildFullSkill();
  assert.equal(
    readFileSync("distribution/full/talksprout/SKILL.md", "utf8"),
    full,
  );
  const docs = buildDocuments();
  for (const p of allPrompts)
    assert.ok(full.includes(docs[`en/prompts/${p.id}.md`]), p.id);
  for (const p of learningPrompts)
    assert.ok(full.includes(docs[`en/prompts/${p.id}.md`]), p.id);
  for (const s of scenes)
    assert.ok(
      full.includes(JSON.stringify({ ...s, title: { en: s.title.en } })),
      s.id,
    );
  for (const [path, body] of Object.entries(docs))
    if (path.includes("/guides/") && !path.endsWith("/index.md"))
      assert.ok(full.includes(body.trimEnd()), path);
});

test("inline templates reconstruct every full and spoken app scenario exactly", () => {
  const full = buildFullSkill();
  for (const p of allPrompts)
    for (const scene of compatibleScenes(p)) {
      const category =
        scene.category === "travel" || scene.category === "services"
          ? "everyday"
          : scene.category;
      for (const pace of (p.id === "roleplay-coach" && category === "interview"
        ? ["coached", "mock"]
        : ["coached"]) as ("coached" | "mock")[]) {
        const template = composeSceneContent(
          p,
          { ...fullSkillScene, category },
          { sceneId: fullSkillScene.id, pace, background: "" },
        );
        const instantiate = (body: string) =>
          body.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => {
            if (key === "title.en") return scene.title.en;
            if (key === "spokencue") return scene.spokenCue.toLowerCase();
            const value = scene[key as keyof typeof scene];
            assert.equal(typeof value, "string", key);
            return value as string;
          });
        const app = composeScene(p, {
          sceneId: scene.id,
          pace,
          background: "",
        });
        for (const key of ["prompt", "spokenPrompt"] as const) {
          assert.ok(
            full.includes(template[key]),
            `${p.id}/${category}/${pace}: bundled template`,
          );
          assert.equal(
            instantiate(template[key]),
            app[key],
            `${p.id}/${scene.id}/${pace}/${key}`,
          );
        }
      }
    }
});
