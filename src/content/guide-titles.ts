import type { GuideText } from "./guide-types";

export const guideTitles: Record<string, GuideText> = {
  "build-a-learning-routine": { zh: "建立能坚持的英语学习习惯", en: "Build a routine you can keep" },
  "use-ai-and-check-feedback": { zh: "使用 AI 并核验它的反馈", en: "Use AI tools and check their feedback" },
  "choose-feedback-style": { zh: "根据目标选择纠错方式", en: "Choose feedback that fits today's goal" },
  "ten-minute-ai-conversation": { zh: "十分钟 AI 口语练习流程", en: "A short AI speaking practice loop" },
  "self-talk-to-real-conversation": { zh: "从自言自语走向真实对话", en: "Turn daily self-talk into a conversation" },
  "listen-check-listen": { zh: "一段短音频的精听与跟读", en: "Work through a short difficult audio segment" },
  "read-and-check-understanding": { zh: "如何阅读并检查自己是否读懂", en: "Read and check your understanding" },
  "write-revise-and-reuse": { zh: "用 AI 练写作，而不只是得到改写", en: "Use AI to practise writing, not just rewriting" },
  "technical-english-in-context": { zh: "在真实语境中学习技术英语", en: "Learn technical English in a useful context" },
  "review-and-reuse-expressions": { zh: "把聊天表达变成可复用能力", en: "Recall and reuse useful expressions" },
  "four-strands-of-language-learning": { zh: "英语学习的四条主线", en: "Four strands of language learning" },
  "ai-dedicated-companions": { zh: "专用对话与机器人：五种英语伙伴", en: "Dedicated chats and bots: five English partners" },
  "ai-global-instructions": { zh: "全局指令：让日常 AI 使用也成为英语接触", en: "Global instructions: bring English into everyday AI use" },
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
