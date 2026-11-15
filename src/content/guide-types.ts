import type { Locale } from "../types";

export type GuideText = Record<Locale, string>;
export type GuideShelf = "practice" | "reading";
export type GuideTopic = "methods" | "ai";
export type GuideGroup = "prepare" | "practise" | "review" | "methods" | "ai";
export interface GuidePrompt {
  id: string;
  title: GuideText;
  body: string;
}
export interface GuideSection {
  id: string;
  title: GuideText;
  paragraphs?: GuideText[];
  steps?: GuideText[];
  example?: string;
  prompt?: GuidePrompt;
}
export interface GuidePractice { promptId: string; label: GuideText }
export interface HandbookArticle {
  id: string;
  title: GuideText;
  summary: GuideText;
  shelf: GuideShelf;
  group: GuideGroup;
  topic: GuideTopic;
  tags: GuideText[];
  sections: GuideSection[];
  practice?: GuidePractice[];
}
