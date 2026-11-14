import { test } from "node:test";
import assert from "node:assert/strict";
import { allPrompts } from "../src/prompts";
import { learningPrompts } from "../src/content/learning";
import { practiceHref, readPracticeShortcuts, readRecentPrompts, recentHref, recordRecent, shortcutKey, type PracticeShortcut, type RecentPrompt } from "../src/shortcuts";
const shortcut: PracticeShortcut = { promptId: "roleplay-coach", variant: "spoken", sceneId: "technical-intro", pace: "mock" };
const storage = (data: Record<string, string>) => ({ getItem: (key: string) => data[key] ?? null });
test("practice shortcuts round trip safe options and strip personal background", () => {
  assert.equal(practiceHref(shortcut), "#library?prompt=roleplay-coach&scene=technical-intro&pace=mock&format=spoken");
  assert.deepEqual(readPracticeShortcuts(storage({ "talksprout:practice-shortcuts": JSON.stringify([{ ...shortcut, background: "secret" }, shortcut]) })), [shortcut]);
  assert.notEqual(shortcutKey(shortcut), shortcutKey({ ...shortcut, variant: "full" }));
});
test("storage rejects malformed, incompatible, and invalid mock settings", () => {
  const invalid = [null, [], {}, { ...shortcut, promptId: "missing" }, { ...shortcut, variant: "bad" }, { ...shortcut, pace: "bad" }, { ...shortcut, promptId: "daily-check-in" }, { ...shortcut, sceneId: "missing" }, { ...shortcut, sceneId: undefined }];
  assert.deepEqual(readPracticeShortcuts(storage({ "talksprout:practice-shortcuts": JSON.stringify(invalid) })), []);
  assert.deepEqual(readPracticeShortcuts(null), []);
  assert.deepEqual(readPracticeShortcuts({ getItem() { throw new Error("blocked"); } }), []);
});
test("recent migration preserves purpose and v2 presence prevents legacy fallback", () => {
  const review = allPrompts.find(p => p.kind === "review")!;
  const migrated = readRecentPrompts(storage({ "talksprout:recent": JSON.stringify(["daily-check-in", review.id, "missing"]) }));
  assert.deepEqual(migrated, [{kind: "practice", promptId: "daily-check-in", variant: "full", pace: "coached"}, {kind: "review", promptId: review.id, variant: "full", source: "current"}]);
  assert.deepEqual(readRecentPrompts(storage({ "talksprout:recent-items": "broken", "talksprout:recent": '["daily-check-in"]' })), []);
});
test("recent history deduplicates full configurations and bounds each purpose", () => {
  let items: RecentPrompt[] = [];
  for (const p of allPrompts.filter(p => p.kind !== "review").slice(0, 6)) items = recordRecent(items, {kind:"practice", promptId:p.id,variant:"full",pace:"coached"});
  for (const p of learningPrompts.slice(0, 6)) items = recordRecent(items, {kind:"learning",promptId:p.id});
  assert.equal(items.filter(i => i.kind === "practice").length, 4);
  assert.equal(items.filter(i => i.kind === "learning").length, 4);
  const entry: RecentPrompt = {kind:"practice",...shortcut};
  assert.deepEqual(recordRecent(recordRecent(items, entry), entry)[0], entry);
  assert.equal(recordRecent(recordRecent(items, entry), entry).filter(i => JSON.stringify(i) === JSON.stringify(entry)).length, 1);
  assert.equal(recentHref({kind:"learning",promptId:learningPrompts[0].id}), `#learning?prompt=${learningPrompts[0].id}`);
});
