import { test } from "node:test";
import assert from "node:assert/strict";
import { handbookArticles, guideGroups, guideTopics, practiceArticles, readingArticles } from "../src/content/guides";
import { readingArticleIds, guideTitles } from "../src/content/guide-titles";
import { filterGuides, guidePracticeHref } from "../src/guides";
import { readRoute } from "../src/navigation";

test("the original companion and reading classifications stay separate", () => {
  assert.equal(practiceArticles.length, 10);
  assert.equal(readingArticles.length, 7);
  assert.equal(new Set(handbookArticles.map(article => article.id)).size, 17);
  assert.deepEqual(guideGroups.filter(group => group.shelf === "practice").map(group => group.id), ["prepare", "practise", "review"]);
  assert.deepEqual(guideGroups.filter(group => group.shelf === "reading").map(group => group.id), ["methods", "ai"]);
  assert.deepEqual(guideTopics.reading.map(topic => topic.id), ["methods", "ai"]);
  assert.deepEqual([...readingArticleIds].sort(), readingArticles.map(article => article.id).sort());
  for (const article of handbookArticles) {
    assert.deepEqual(article.title, guideTitles[article.id]);
    assert.equal(guideGroups.filter(group => group.id === article.group && group.shelf === article.shelf).length, 1);
    assert.equal(readRoute(`#guides/${article.id}`).guideId, article.id);
  }
});

test("resource search is bilingual and broader than named providers", () => {
  assert.equal(filterGuides(readingArticles, "Doubao")[0]?.id, "ai-tool-capabilities");
  assert.equal(filterGuides(readingArticles, "Gemini")[0]?.id, "ai-tool-capabilities");
  assert.equal(filterGuides(readingArticles, "主动回忆")[0]?.id, "spacing-retrieval-and-repetition");
  assert.equal(filterGuides(readingArticles, "Poe")[0]?.id, "ai-dedicated-companions");
  assert.equal(filterGuides(practiceArticles, "Doubao").length, 0);
  assert.equal(filterGuides(readingArticles, "Gemini", "methods").length, 0);
});

test("articles are bilingual; resources are independent and companions use valid contextual tools", () => {
  for (const article of handbookArticles) {
    assert.ok(article.sections.length >= 3);
    assert.equal(new Set(article.sections.map(section => section.id)).size, article.sections.length);
    for (const locale of ["zh", "en"] as const) {
      assert.ok(article.title[locale].trim());
      assert.ok(article.summary[locale].trim());
      for (const section of article.sections) {
        assert.ok(section.title[locale].trim());
        assert.ok((section.paragraphs?.length ?? 0) + (section.steps?.length ?? 0) > 0);
        for (const text of [...(section.paragraphs ?? []), ...(section.steps ?? [])]) assert.ok(text[locale].trim());
      }
    }
    if (article.shelf === "reading") assert.ok(!("practice" in article));
    else {
      assert.ok(article.practice?.length);
      for (const practice of article.practice ?? []) {
        const route = readRoute(guidePracticeHref(practice.promptId));
        assert.equal(route.promptId ?? route.learningPromptId, practice.promptId);
      }
    }
  }
  assert.doesNotMatch(JSON.stringify(handbookArticles), /https?:\/\/|\/Users\/|x-coredata|ICNote|Downloads\//);
});

test("AI reference has three distinct articles with copyable configurations", () => {
  assert.deepEqual(readingArticles.filter(article => article.topic === "ai").map(article => article.id), ["ai-tool-capabilities", "ai-dedicated-companions", "ai-global-instructions"]);
  for (const id of ["chatgpt-learning", "doubao-learning", "gemini-learning"]) assert.equal(readRoute(`#guides/${id}`).guideId, "ai-tool-capabilities");
  assert.equal(readRoute("#guides/judge-ai-learning-advice").guideId, "ai-tool-capabilities");
  const bots = readingArticles.find(article => article.id === "ai-dedicated-companions")!;
  const global = readingArticles.find(article => article.id === "ai-global-instructions")!;
  assert.ok(bots.sections.filter(section => "prompt" in section).length >= 5);
  assert.ok(JSON.stringify(global).includes("at least ~70% English words"));
});
