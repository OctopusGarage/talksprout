export const categoryNames = [
  "全部练习",
  "日常陪练",
  "互动训练",
  "素材练习",
  "结束与复习",
] as const;
export type Category = (typeof categoryNames)[number];
export type Locale = "zh" | "en";
export type PromptVariant = "full" | "spoken";
export type ReviewSource = "current" | "transcript";
interface PromptContent {
  id: string;
  title: string;
  english: string;
  icon: string;
  description: string;
  feedback: string;
  requires: string;
  guide: string;
  prompt: string;
  spokenPrompt: string;
  version: number;
  tags: string[];
  mode: "voice" | "text" | "both";
  needsMaterial: boolean;
  descriptionEn: string;
  feedbackEn: string;
  requiresEn: string;
  guideEn: string;
}
export interface ConversationPrompt extends PromptContent {
  kind?: "practice";
  category: Exclude<Category, "全部练习" | "结束与复习">;
  level: string;
  minutes: string;
  commands: { help: string; review: string; finish: string; done?: string };
}
export interface ReviewPrompt extends PromptContent {
  kind: "review";
  category: "结束与复习";
  recommended?: boolean;
}
export type Prompt = ConversationPrompt | ReviewPrompt;
