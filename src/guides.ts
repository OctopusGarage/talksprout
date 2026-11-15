import { allPrompts } from "./prompts";
import { learningPrompts } from "./content/learning";
import type { HandbookArticle, GuideTopic } from "./content/guide-types";

export function filterGuides(articles: HandbookArticle[], query: string, topic: GuideTopic | "all" = "all") {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return articles.filter(article => {
    if (topic !== "all" && article.topic !== topic) return false;
    const text = JSON.stringify([article.title, article.summary, article.tags, article.sections]).toLocaleLowerCase();
    return terms.every(term => text.includes(term));
  });
}

export function guideEntryId(id: string) { return `guide-entry-${id}`; }

export function guidePracticeHref(promptId: string): string {
  if (learningPrompts.some(prompt => prompt.id === promptId)) return `#learning?prompt=${promptId}`;
  const prompt = allPrompts.find(prompt => prompt.id === promptId);
  if (!prompt) throw new Error(`Unknown guide practice: ${promptId}`);
  return `${prompt.kind === "review" ? "#review" : "#library"}?prompt=${promptId}`;
}
