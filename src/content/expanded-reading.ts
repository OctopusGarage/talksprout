import type { HandbookArticle } from "./guide-types";
import { foundationArticles } from "./handbook-foundations";
import { aiArticles } from "./handbook-ai";
import { independentMethods } from "./methodology-everyday";

const allExpanded = [...foundationArticles, ...independentMethods, ...aiArticles];
export const expandedArticles: HandbookArticle[] = [
  "four-strands-of-language-learning", "english-in-everyday-life", "spacing-retrieval-and-repetition", "choose-learning-materials",
  "ai-tool-capabilities", "ai-dedicated-companions", "ai-global-instructions",
].map(id => {
  const article = allExpanded.find(article => article.id === id);
  if (!article) throw new Error(`Missing expanded article: ${id}`);
  return article;
});
