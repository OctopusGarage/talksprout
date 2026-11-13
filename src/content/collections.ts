export const collections = [
  {
    id: "companions",
    category: "日常陪练",
    titleEn: "Conversation coaches",
    description: "先选一种纠错方式，再聊任何你感兴趣的话题。",
    descriptionEn:
      "Choose how you want to be coached, then talk about anything.",
    icon: "♡",
  },
  {
    id: "interaction",
    category: "互动训练",
    titleEn: "Interactive coaching",
    description: "让 AI 用扮演、辩论或猜词带你练习，并及时纠正表达。",
    descriptionEn:
      "Practice through role-play, debate, or word games with focused feedback.",
    icon: "↔",
  },
  {
    id: "materials",
    category: "素材练习",
    titleEn: "Practice with material",
    description: "用图片或阅读内容开启对话，把描述和复述变成表达练习。",
    descriptionEn:
      "Use an image or a short text to practice describing and retelling.",
    icon: "▧",
  },
] as const;

export const reviewCollection = {
  id: "review",
  category: "结束与复习",
  titleEn: "Wrap-up & Review",
  description: "结束聊天后，把这次对话整理成下次能用的学习材料。",
  descriptionEn:
    "After your conversation, turn it into study material for next time.",
  icon: "▤",
} as const;

export const allCollections = [...collections, reviewCollection];
