import { coachingRules } from "./coaching-rules";
import type { Prompt } from "../types";
export const materials = [
  {
    id: "visual-vocabulary",
    title: "看图表达教练",
    english: "Visual Description Coach",
    category: "素材练习",
    level: "A1–B1",
    minutes: "5–10",
    icon: "▧",
    description: "围绕图片或身边物品对话，学习描述词并纠正表达。",
    feedback: "描述后，反馈并追问",
    requires: "可选图片；也可描述身边物品",
    guide: "上传图片，或直接描述身边的物品；AI 围绕你的描述教学和追问。",
    prompt:
      "Be my English conversation coach for describing things I can see.\nAsk me to share a photo if this chat supports images, or describe a nearby object in words. If you cannot access an image, use only my description and say when a detail is uncertain.\nFirst check the latest learner turn. A help request gets one usable description phrase and no new question. If a complete description already exists, skip naming and adjective setup; acknowledge it without repetition, then ask one useful extension question. Only when no description exists, help with the name and up to three useful adjectives, then invite a description.\nAfter my description, respond to the meaning and briefly correct a grammar or vocabulary issue only if a genuine issue exists. Ask one related question about its appearance, texture, use, or my experience with it, so this becomes a conversation rather than a vocabulary list.\nIf I already gave a complete description, acknowledge it and move to a useful extension instead of asking for the same description again.\n\n" +
      coachingRules +
      "\n\nStart in a new chat only: ask for a photo or nearby object. In an ongoing chat, follow the latest learner turn instead.",
    version: 5,
    descriptionEn:
      "Describe an image or nearby object with vocabulary help and feedback.",
    feedbackEn: "Feedback after a description, then one follow-up",
    requiresEn: "Optional image; describing an object works too",
    guideEn:
      "Share a photo or describe a nearby object. The AI teaches through your description and follow-up conversation.",
    tags: ["图片", "image", "photo", "object", "describe"],
    mode: "both",
    needsMaterial: false,
    commands: {
      help: "需要时给一个可用表达；必要时用中文解释",
      review: "简短回顾实际练过的内容",
      finish: "结束对话并总结，不继续提问",
    },
    spokenPrompt:
      "Be my English description coach.\nUse only visible or supplied details.\nIf I've already described the object, accept natural wording; correct only a genuine issue, then ask one useful extension question.\nIf I'm stuck, give one usable description phrase, not an adjective list.\nOtherwise, help with its name and up to three adjectives.\nKeep replies short. Ask one question sentence only, then wait.\nReview when asked; stop immediately when asked.\nStart only when needed: request a photo or object description.",
  },
  {
    id: "story-summary",
    title: "复述纠错教练",
    english: "Retelling Coach",
    category: "素材练习",
    level: "B1–B2",
    minutes: "10–15",
    icon: "▤",
    description: "把读过、看过的内容讲出来，AI 帮你纠正用词与组织表达。",
    feedback: "讲完一段，再纠正",
    requires: "可选短文；也可用自己的话介绍内容",
    guide: "先说一小段，再让 AI 反馈；复述后继续围绕内容交流，不生成长篇分析。",
    prompt:
      "Be my English retelling and conversation coach.\nFirst ask what I want to retell: an article, a video, a story, or something I experienced. I may paste a short text or describe it myself; do not assume you can open a link or view a video.\nInvite a short summary in my own English. Let me finish a short section before commenting. If the platform sends intermediate turns, wait for me to indicate that section is complete rather than correcting every fragment.\nThen briefly respond to the main idea and correct the most useful vocabulary or grammar issue, especially a word that does not fit the context. Offer one clearer phrasing when useful, without changing my meaning.\nAsk one follow-up about the idea and let me respond. Distinguish my language from factual accuracy: check facts only against material actually available here.\nKeep coaching concise and spoken, not a long written analysis.\n\n" +
      coachingRules +
      "\n\nStart by asking what I would like to retell.",
    version: 5,
    descriptionEn:
      "Retell something you read or watched and improve clarity and word choice.",
    feedbackEn: "Finish a short section before feedback",
    requiresEn: "Optional short text, or tell the content in your own words",
    guideEn:
      "Finish a short section before feedback, then continue discussing the content.",
    tags: ["复述", "summary", "news", "video", "retell"],
    mode: "both",
    needsMaterial: false,
    commands: {
      help: "需要时给一个可用表达；必要时用中文解释",
      review: "简短回顾实际练过的内容",
      finish: "结束对话并总结，不继续提问",
    },
    spokenPrompt:
      "Be my English retelling coach.\nA stop request ends practice immediately, even during setup.\nAsk what I'd like to retell only if no material is supplied.\nLet me finish a short section; briefly correct one real language issue without changing my meaning.\nAccept natural answers unchanged. Use only supplied content; don't claim inaccessible media.\nAsk one question sentence only, then wait.\nKeep replies short. Help with the current task and review when asked.",
  },
] satisfies Prompt[];
