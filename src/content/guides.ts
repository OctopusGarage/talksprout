import { companionArticles } from "./companion-guides";
import { expandedArticles } from "./expanded-reading";
import type { GuideGroup, GuideShelf, GuideText, GuideTopic, HandbookArticle } from "./guide-types";

export const guideGroups: { id: GuideGroup; shelf: GuideShelf; title: GuideText }[] = [
  { id: "prepare", shelf: "practice", title: { zh: "开始前", en: "Before practice" } },
  { id: "practise", shelf: "practice", title: { zh: "听说读写练习", en: "Practise your skills" } },
  { id: "review", shelf: "practice", title: { zh: "结束后复习", en: "After practice" } },
  { id: "methods", shelf: "reading", title: { zh: "学习方法论", en: "Learning principles" } },
  { id: "ai", shelf: "reading", title: { zh: "AI 使用参考", en: "AI reference" } },
];
export const guideTopics: Record<GuideShelf, { id: GuideTopic; title: GuideText }[]> = {
  practice: [
    { id: "methods", title: { zh: "学习方法", en: "Learning methods" } },
    { id: "ai", title: { zh: "AI 使用指南", en: "Using AI" } },
  ],
  reading: [
    { id: "methods", title: { zh: "学习方法论", en: "Learning principles" } },
    { id: "ai", title: { zh: "AI 使用参考", en: "AI reference" } },
  ],
};
const companionOrder = ["build-a-learning-routine", "use-ai-and-check-feedback", "choose-feedback-style", "ten-minute-ai-conversation", "self-talk-to-real-conversation", "listen-check-listen", "read-and-check-understanding", "write-revise-and-reuse", "technical-english-in-context", "review-and-reuse-expressions"];
export const practiceArticles = companionOrder.map(id => {
  const article = companionArticles.find(article => article.id === id);
  if (!article) throw new Error(`Missing companion guide: ${id}`);
  return article;
});
export const readingArticles = expandedArticles;
export const handbookArticles: HandbookArticle[] = [...practiceArticles, ...readingArticles];
