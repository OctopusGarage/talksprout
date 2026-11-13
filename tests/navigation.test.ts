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
