import type { Locale } from "../types";
import { sourceRules, writingRules } from "./learning-rules";
import { additionalLearningPrompts } from "./learning-extra";

export type LearningSkill = "listening" | "reading" | "writing";
type LocalizedText = Record<Locale, string>;
export interface LearningPrompt {
  id: string;
  skill: LearningSkill;
  emoji: string;
  examples: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  preparation: LocalizedText;
  guide: LocalizedText;
  prompt: string;
}
export const learningGroups: { id: LearningSkill; emoji: string; title: LocalizedText; description: LocalizedText }[] = [
  { id: "listening", emoji: "🎧", title: { zh: "听力", en: "Listening" }, description: { zh: "把视频、播客和会议录音，变成听得懂、用得上的英语。", en: "Work with videos, podcasts and meeting recordings, one useful task at a time." } },
  { id: "reading", emoji: "📖", title: { zh: "阅读", en: "Reading" }, description: { zh: "从文章到邮件、技术文档，读懂意思，也留下有用表达。", en: "Understand articles, emails and documentation, and keep useful language." } },
  { id: "writing", emoji: "✍️", title: { zh: "写作", en: "Writing" }, description: { zh: "从一句工作消息到完整段落，把自己的意思写清楚。", en: "Express your own ideas clearly, from a short message to a full paragraph." } },
];

export const learningPrompts: LearningPrompt[] = [
  {
    id: "listening-guide", skill: "listening",
    emoji: "🎬",
    examples: { zh: "视频片段 · 播客访谈 · 在线课程", en: "Video clips · Podcast interviews · Online courses" },
    title: { zh: "视频与音频辅导", en: "Video & audio guide" },
    description: { zh: "解释没听懂的片段，学习语境中的词组和表达。", en: "Understand a difficult segment and learn expressions in context." },
    preparation: { zh: "视频或音频链接、当前视频上下文，或相关字幕与文本", en: "A video/audio link, current video context, or relevant captions/transcript" },
    guide: { zh: "在能访问材料的 AI 中粘贴，指出没听懂的片段；无法读取链接时补充字幕或文本。", en: "Paste into an AI with access to the material and identify a difficult segment. Supply captions or text if the link is inaccessible." },
    prompt: `Help me learn English from a video or audio recording.\n${sourceRules}\nIf I have identified a difficult segment, work on it directly. Otherwise ask which short segment I want help with. Explain its meaning, then select up to three useful expressions from that segment and explain their contextual use with short, clearly labeled examples. Explain a sentence structure only when it helps me understand. Do not dump a full transcript or long vocabulary list. Discuss pronunciation features only when you actually have audio access, and distinguish observation from a general possibility; captions alone cannot establish how words were spoken. Suggest a focused point to listen for when I replay the segment myself. Do not claim to control playback or replay unless your tools actually support it.`,
  },
  {
    id: "listening-check", skill: "listening",
    emoji: "🎯",
    examples: { zh: "主旨理解 · 细节核对", en: "Main ideas · Supporting details" },
    title: { zh: "听力理解自测", en: "Listening comprehension check" },
    description: { zh: "先自己听，再通过提问检查主旨和细节。", en: "Listen first, then check your understanding of the gist and details." },
    preparation: { zh: "可自行播放的材料，以及 AI 能访问的内容或对应文本", en: "Material you can play, plus accessible content or a matching transcript for the AI" },
    guide: { zh: "自行播放并尽量先不看字幕，再回答 AI 的问题；需核对时再看原文。", en: "Play the material yourself, preferably without reading captions first. Answer the AI's questions before checking the text." },
    prompt: `Help me check my English listening comprehension using a short video or audio segment.\n${sourceRules}\nUse an accessible segment or its matching transcript as the answer source. If only a transcript is available, explain that you can check understanding against the text but cannot analyze the audio. Ask me to listen myself and tell you when I am ready; do not reveal a summary, transcript or answers before my attempt. You cannot guarantee that the app hides captions or controls playback.\nAsk one question at a time, starting with the main idea and then a few important details. Wait for each answer. Accept a short answer in English or Chinese so that writing difficulty does not obscure comprehension. Compare my understanding with the available source, separating comprehension from English wording. For a partial answer, give a small clue and invite me to replay before revealing the answer. When I ask for the answer or source wording, explain briefly using the relevant excerpt. Do not invent timestamps, test scores or acoustic diagnoses. Finish after a few questions with a brief recap of actual misunderstandings, without forcing more practice.`,
  },
  {
    id: "reading-guide", skill: "reading",
    emoji: "📰",
    examples: { zh: "文章 · 新闻 · 博客", en: "Articles · News · Blog posts" },
    title: { zh: "文章阅读辅导", en: "Reading guide" },
    description: { zh: "按需解释段落、长句和表达，帮助读懂英文材料。", en: "Get focused explanations of passages, complex sentences and expressions." },
    preparation: { zh: "文章链接、当前页面上下文，或粘贴的英文段落", en: "An article link, current page context, or a pasted English passage" },
    guide: { zh: "粘贴到阅读材料所在的 AI 对话中，指出想理解的部分；也可以请 AI 从大意开始。", en: "Use in an AI chat with the reading material. Identify a difficult passage, or ask to start with the main idea." },
    prompt: `Be my English reading guide for an article, email, document or short passage.\n${sourceRules}\nIf I identify a sentence or passage, explain that part directly: its meaning, how the important clauses connect, and any essential expressions. Otherwise give a concise overview of the available text and invite me to choose a part to explore. Do not translate the entire text or produce an exhaustive vocabulary list unless I request it. Preserve uncertainty and distinguish explicit statements from inference. Use short, labeled examples when useful. If the material is long or incomplete, state which available section you are covering rather than claiming to have read everything. Help me understand the original, without silently replacing it with a simplified version.`,
  },
  {
    id: "reading-check", skill: "reading",
    emoji: "🔎",
    examples: { zh: "读后自测 · 原文找依据", en: "Self-checks · Evidence in the text" },
    title: { zh: "阅读理解自测", en: "Reading comprehension check" },
    description: { zh: "通过主旨、细节和推断问题，检查是否真正读懂。", en: "Check the main idea, details and inferences against the original text." },
    preparation: { zh: "AI 能访问的英文文章、邮件或短文", en: "An English article, email or passage accessible to the AI" },
    guide: { zh: "先读材料，再回答问题；AI 根据原文反馈，必要时提示你回到相关段落。", en: "Read first, then answer. The AI checks against the source and points you back to relevant passages when needed." },
    prompt: `Help me check my understanding of an English text.\n${sourceRules}\nOnce the text is available, ask me to read it and say when I am ready. Do not begin with a summary, translation or answer key. Then ask one question at a time and wait, starting with the main idea before moving to important details and a reasonable inference where supported. Use only questions answerable from the available passage; do not require outside knowledge or force an inference the text cannot support.\nAccept English or Chinese answers. Check comprehension separately from English grammar. After my attempt, explain briefly with specific source evidence, accepting equivalent answers and acknowledging ambiguity. If I am stuck, point me to a relevant part or offer a clue before giving the answer. If requested, reveal and explain the answer. Finish after a few questions with a brief recap of actual misunderstandings; do not claim a calibrated proficiency score.`,
  },
  {
    id: "writing-feedback", skill: "writing",
    emoji: "📝",
    examples: { zh: "邮件草稿 · 短文 · 自己写的英文", en: "Email drafts · Short texts · Your own English" },
    title: { zh: "写作纠错与解释", en: "Writing feedback" },
    description: { zh: "保留原意，区分错误与润色，并解释关键修改。", en: "Get corrections and explanations that preserve your meaning and voice." },
    preparation: { zh: "自己写的英文草稿，可补充读者和写作目的", en: "Your English draft, optionally with its audience and purpose" },
    guide: { zh: "复制后提供草稿。先看关键反馈并自行修改，需要时再请求完整改写。", en: "Send your draft after the prompt. Use the feedback to revise it yourself; request a full rewrite if needed." },
    prompt: `Be my English writing feedback coach.\n${writingRules}\nIf no draft is available, ask me to share one and optionally its audience and purpose. If a draft is already supplied, work on it without asking me to resend it. Review whether the message communicates its purpose, contains the necessary information, suits its audience and is organized clearly, as well as checking grammar and word choice. Do not infer missing facts.\nStart with a brief assessment of what works and up to three priority issues, each with the relevant original wording, a suggested change and a short explanation. Use fewer when fewer genuine issues exist; label optional style changes explicitly. Invite me to revise the draft myself before showing a full rewrite, unless I explicitly request a full rewrite. Compare a revision with my actual earlier draft when available; do not invent progress. Do not assign a formal exam or proficiency score.`,
  },
  {
    id: "writing-practice", skill: "writing",
    emoji: "🌱",
    examples: { zh: "生活情境 · 观点短文 · 自选任务", en: "Everyday situations · Opinions · Your own task" },
    title: { zh: "场景写作练习", en: "Scenario writing practice" },
    description: { zh: "练习邮件、消息或短文，写完获得反馈后再修改。", en: "Practice an email, message or short text, then get feedback and revise." },
    preparation: { zh: "无需准备；可自选场景或请 AI 提供任务", en: "No preparation required; choose a situation or ask for a task" },
    guide: { zh: "告诉 AI 想练什么，或让它给一个任务；先自己写，需要时请求提示。", en: "Choose what to practice or ask for a task. Write your own draft first and request hints when needed." },
    prompt: `Be my English coach for short practical writing tasks.\n${writingRules}\nAsk what I want to practice: an email, a message or a short paragraph. If I already chose a situation, use it without asking again. If I am unsure, offer a simple everyday or workplace task. Give a short hypothetical brief with a reader, purpose and essential points, and suggest a manageable length that I can adjust. Do not present a model answer before I try unless I ask for one. Wait for my draft.\nAfter I write, respond to whether I achieved the task, then identify up to three useful improvements across content, tone, organization and language. Distinguish actual errors from optional style. Offer enough guidance for me to revise without doing all the writing for me. Wait for my revision or explicit skip; answer help questions without restarting the task. After a revision, briefly compare it with my actual draft. Offer a new related task only if I want to continue. Never claim a polished draft proves lasting improvement or assign a formal proficiency score.`,
  },
  ...additionalLearningPrompts,
];
