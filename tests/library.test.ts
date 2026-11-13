import { test } from "node:test";
import assert from "node:assert/strict";
import { filterPrompts, readSaved, writeSaved } from "../src/library.ts";
import { prompts } from "../src/prompts.ts";
test("search supports Chinese and case insensitive English with category intersection", () => {
  assert.equal(
    filterPrompts(prompts, { query: "点单" })[0].id,
    "roleplay-coach",
  );
  assert.equal(
    filterPrompts(prompts, { query: "COFFEE" })[0].id,
    "roleplay-coach",
  );
  assert.equal(
    filterPrompts(prompts, { query: "coffee", category: "日常陪练" }).length,
    0,
  );
});
test("favorites are filtered by stable IDs", () =>
  assert.equal(
    filterPrompts(prompts, {
      favoritesOnly: true,
      favorites: ["word-riddle"],
    })[0].id,
    "word-riddle",
  ));
test("invalid and inaccessible storage safely falls back", () => {
  for (const raw of ["{", "null", "{}", '[1,"roleplay-coach"]'])
    assert.deepEqual(
      readSaved({ getItem: () => raw }, "x"),
      raw.startsWith("[1") ? ["roleplay-coach"] : [],
    );
  assert.deepEqual(
    readSaved(
      {
        getItem() {
          throw Error();
        },
      },
      "x",
    ),
    [],
  );
  assert.equal(
    writeSaved(
      {
        setItem() {
          throw Error();
        },
      },
      "x",
      [],
    ),
    false,
  );
});
test("all prompts have unique IDs and complete editorial metadata", () => {
  assert.ok(prompts.length === 9);
  assert.equal(new Set(prompts.map((p) => p.id)).size, prompts.length);
  for (const p of prompts)
    for (const key of [
      "title",
      "english",
      "guide",
      "requires",
      "prompt",
    ] as const)
      assert.ok(p[key].length > 0);
});

test("content modules cover three small coach collections", () => {
  assert.equal(prompts.length, 9);
  assert.equal(filterPrompts(prompts, { category: "日常陪练" }).length, 4);
  assert.equal(filterPrompts(prompts, { category: "互动训练" }).length, 3);
  assert.equal(filterPrompts(prompts, { category: "素材练习" }).length, 2);
});

test("search understands learning aliases and multiple terms", () => {
  assert.ok(
    filterPrompts(prompts, { query: "语法" }).some(
      (p) => p.id === "focused-correction",
    ),
  );
  assert.ok(
    filterPrompts(prompts, { query: "job interview" }).some(
      (p) => p.id === "roleplay-coach",
    ),
  );
});
test("beginner guidance and material descriptions match the exercises", () => {
  const a1 = filterPrompts(prompts, { level: "A1" });
  assert.ok(a1.some((p) => p.id === "gentle-start"));
  assert.ok(!a1.some((p) => p.id === "friendly-debate"));
  assert.ok(prompts.every((p) => p.mode === "both"));
});
