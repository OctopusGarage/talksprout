import type { GuideText } from "./guide-types";

export const guideTitles: Record<string, GuideText> = {
  "complete-workflow": { zh: "从开始练习到保存笔记", en: "From first practice to saved study notes" },
  "build-a-learning-routine": { zh: "建立能坚持的英语学习习惯", en: "Build a routine you can keep" },
  "use-ai-and-check-feedback": { zh: "使用 AI 并核验它的反馈", en: "Use AI tools and check their feedback" },
  "choose-feedback-style": { zh: "根据目标选择纠错方式", en: "Choose feedback that fits today's goal" },
  "ten-minute-ai-conversation": { zh: "十分钟 AI 口语练习流程", en: "A short AI speaking practice loop" },
  "self-talk-to-real-conversation": { zh: "从自言自语走向真实对话", en: "Turn daily self-talk into a conversation" },
  "listen-check-listen": { zh: "一段短音频的精听与跟读", en: "Work through a short difficult audio segment" },
  "read-and-check-understanding": { zh: "阅读与理解自测", en: "Reading and comprehension checks" },
  "write-revise-and-reuse": { zh: "写作、修改与复用", en: "Write, revise and reuse" },
  "technical-english-in-context": { zh: "技术英语练习", en: "Practise technical English" },
  "review-and-reuse-expressions": { zh: "整理与复习表达", en: "Review and reuse expressions" },
  "four-strands-of-language-learning": { zh: "英语学习的四条主线", en: "Four strands of language learning" },
  "ai-dedicated-companions": { zh: "专用英语伙伴", en: "Dedicated English partners" },
  "ai-global-instructions": { zh: "全局指令：日常英语偏好", en: "Global instructions for everyday English" },
  "english-in-everyday-life": { zh: "让英语融入已有的生活", en: "Give English a place in everyday life" },
  "spacing-retrieval-and-repetition": { zh: "重复、间隔与主动回忆", en: "Repetition, spacing and retrieval" },
  "choose-learning-materials": { zh: "选择材料与使用词典", en: "Choose material and use dictionaries well" },
  "ai-tool-capabilities": { zh: "实时语音：用 AI 练听说", en: "Live voice: practise listening and speaking" },
};

export const readingArticleIds = new Set([
  "four-strands-of-language-learning", "english-in-everyday-life", "spacing-retrieval-and-repetition", "choose-learning-materials",
  "ai-tool-capabilities", "ai-dedicated-companions", "ai-global-instructions",
]);
export function canonicalGuideId(id: string): string {
  return ["chatgpt-learning", "doubao-learning", "gemini-learning", "judge-ai-learning-advice"].includes(id) ? "ai-tool-capabilities" : id;
}
