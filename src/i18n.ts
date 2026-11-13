import type { Prompt } from "./types";
export type Locale = "zh" | "en";
export const dictionary = {
  zh: {
    brand: "开口芽",
    search: "搜索陪练模式",
    all: "全部练习",
    favorites: "我的收藏",
    reset: "清除筛选",
    empty: "没有找到匹配的练习",
    emptyFavorites: "还没有收藏的练习",
    emptyHint: "试试其他关键词，或清除筛选。",
    favoriteHint: "点击卡片上的爱心收藏练习。",
    copy: "复制提示词",
    detail: "查看详情",
    close: "关闭",
    ready: "无需材料",
    material: "需准备材料",
    voice: "语音",
    text: "文字",
    both: "语音或文字",
    copied: "已复制！粘贴到常用 AI 开始练习。",
    manual: "自动复制不可用。请选中下方全文，手动复制。",
    saveError: "浏览器无法保存，当前操作仅本次有效。",
  },
  en: {
    brand: "TalkSprout",
    search: "Search coaches",
    all: "All practice",
    favorites: "My favorites",
    reset: "Reset filters",
    empty: "No matching practice",
    emptyFavorites: "No favorites yet",
    emptyHint: "Try another search or reset your filters.",
    favoriteHint: "Use the heart on a card to save practice.",
    copy: "Copy prompt",
    detail: "View details",
    close: "Close",
    ready: "No materials needed",
    material: "Materials needed",
    voice: "Voice",
    text: "Text",
    both: "Voice or text",
    copied: "Copied! Paste into your AI to start practicing.",
    manual:
      "Automatic copying is unavailable. Select the full text below and copy manually.",
    saveError: "Storage unavailable. Changes last only for this session.",
  },
};
export const categoryEnglish: Record<string, string> = {
  全部练习: "All coaches",
  日常陪练: "Conversation coaches",
  互动训练: "Interactive coaching",
  素材练习: "Practice with material",
  结束与复习: "Wrap-up & Review",
};
export function metadata(
  p: Prompt,
  key: "description" | "guide" | "requires" | "feedback",
  locale: Locale,
) {
  return locale === "en" ? p[`${key}En`] : p[key];
}
export function initialLocale(): Locale {
  try {
    const l = localStorage.getItem("talksprout:locale");
    if (l === "en" || l === "zh") return l;
  } catch {}
  return navigator.language.startsWith("zh") ? "zh" : "en";
}
