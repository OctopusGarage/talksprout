import { test } from "node:test";
import assert from "node:assert/strict";
import { readRoute } from "../src/navigation";
import { allPrompts } from "../src/prompts";

test("existing collection and review URLs retain their destination", () => {
  assert.deepEqual(readRoute("#collection/companions"), {
    page: "practice",
    collection: "companions",
    base: "#collection/companions",
    promptId: null,
    learningPromptId: null,
    infoId: null,
  });
  assert.equal(readRoute("#collection/materials").collection, "materials");
  assert.equal(readRoute("#collection/review").base, "#review");
  assert.equal(readRoute("#settings").page, "settings");
  assert.equal(readRoute("#unknown").base, "#library");
});
test("a prompt deep link opens only in the matching purpose", () => {
  for (const p of allPrompts) {
    const base = p.kind === "review" ? "#review" : "#library";
    assert.equal(readRoute(`${base}?prompt=${p.id}`).promptId, p.id);
    const wrong = p.kind === "review" ? "#library" : "#review";
    assert.equal(readRoute(`${wrong}?prompt=${p.id}`).promptId, null);
    assert.equal(readRoute(`#settings?prompt=${p.id}`).promptId, null);
  }
  assert.equal(readRoute("#review?prompt=missing").promptId, null);
});

test("settings sheets can be deep linked without leaking into practice routes", () => {
  assert.equal(readRoute("#settings?info=about").infoId, "about");
  assert.equal(readRoute("#settings?info=install").infoId, "install");
  assert.equal(readRoute("#library?info=about").infoId, null);
  assert.equal(readRoute("#settings?info=unknown").infoId, null);
});


test("supplementary links stay separate from coaches and reviews", () => {
  assert.equal(readRoute("#learning?prompt=writing-feedback").learningPromptId, "writing-feedback");
  assert.equal(readRoute("#learning?prompt=writing-feedback").promptId, null);
  for (const path of ["#library", "#review", "#settings", "#collection/materials"])
    assert.equal(readRoute(`${path}?prompt=writing-feedback`).learningPromptId, null);
  assert.equal(readRoute("#learning?prompt=daily-check-in").promptId, null);
  assert.equal(readRoute("#learning?prompt=missing").learningPromptId, null);
});

test("practice links restore compatible scenario without personal background", () => {
  const route = readRoute("#library?prompt=roleplay-coach&scene=technical-intro&pace=mock&format=spoken&background=secret");
  assert.deepEqual(route.sceneSelection, {sceneId:"technical-intro",pace:"mock",background:""});
  assert.equal(route.format, "spoken");
  assert.equal(readRoute("#library?prompt=daily-check-in&scene=technical-intro&pace=mock").sceneSelection?.pace, "coached");
  assert.equal(readRoute("#library?prompt=roleplay-coach&scene=missing").sceneSelection, undefined);
  assert.equal(readRoute("#settings?scene=technical-intro&format=spoken").format, undefined);
});
test("review options apply only to matching review prompts", () => {
  const review = allPrompts.find(p => p.kind === "review")!;
  const route = readRoute(`#review?prompt=${review.id}&source=transcript&format=spoken&scene=technical-intro`);
  assert.equal(route.reviewSource, "transcript");
  assert.equal(route.format, "spoken");
  assert.equal(route.sceneSelection, undefined);
  assert.equal(readRoute("#library?prompt=daily-check-in&source=transcript").reviewSource, undefined);
});
