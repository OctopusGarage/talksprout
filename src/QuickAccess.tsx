import { useEffect, useId, useState } from "react";
import { allPrompts } from "./prompts";
import { learningPrompts } from "./content/learning";
import { scenes } from "./scenes";
import { practiceHref, recentHref, shortcutKey, type PracticeShortcut, type RecentPrompt } from "./shortcuts";
import { navigate } from "./navigation";
import { Icon } from "./Icon";
import type { Locale } from "./types";

function open(href: string, id: string, learning = false) {
  navigate(href, learning ? { talksproutLearningPrompt: id } : { talksproutPrompt: id });
}
export function shortcutLabel(entry: PracticeShortcut, locale: Locale) {
  const prompt = allPrompts.find(p => p.id === entry.promptId)!;
  const scene = scenes.find(s => s.id === entry.sceneId);
  return [locale === "en" ? prompt.english : prompt.title, scene?.title[locale]].filter(Boolean).join(" · ");
}
export function SavedPracticeList({ items, locale, onRemove }: { items: PracticeShortcut[]; locale: Locale; onRemove: (item: PracticeShortcut) => void }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const canExpand = items.length > 3;
  useEffect(() => {
    if (!canExpand) setExpanded(false);
  }, [canExpand]);
  if (!items.length) return null;
  const en = locale === "en";
  const visibleItems = expanded ? items : items.slice(0, 3);
  return <section className="quick-access" aria-label={en ? "Saved practice combinations" : "常用练习组合"}>
    <h2 className="section-label">{en ? "Saved combinations" : "常用组合"}</h2>
    <div className="native-list" id={listId}>{visibleItems.map(item => <div className="quick-row" key={shortcutKey(item)}>
      <button className="quick-open" onClick={() => open(practiceHref(item), item.promptId)}>
        <strong>{shortcutLabel(item, locale)}</strong>
        <small>{item.variant === "spoken" ? (en ? "Spoken opening" : "语音开场白") : (en ? "Full prompt" : "完整提示词")}{item.pace === "mock" ? (en ? " · Mock interview" : " · 模拟面试") : ""}</small>
      </button>
      <button className="icon-button" aria-label={`${en ? "Remove combination" : "移除组合"}：${shortcutLabel(item, locale)}`} onClick={() => onRemove(item)}><Icon name="close" /></button>
    </div>)}</div>
    {canExpand && <button className="quick-access-toggle" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded(value => !value)}>
      {expanded ? (en ? "Show fewer combinations" : "收起组合") : (en ? `Show all ${items.length} combinations` : `展开全部 ${items.length} 个组合`)}
    </button>}
  </section>;
}
export function RecentList({ items, locale }: { items: RecentPrompt[]; locale: Locale }) {
  if (!items.length) return null;
  const en = locale === "en";
  return <section className="quick-access" aria-label={en ? "Recently copied" : "最近复制"}>
    <h2 className="section-label">{en ? "Recently copied" : "最近复制"}</h2>
    <div className="native-list">{items.slice(0, 3).map(item => {
      const prompt = allPrompts.find(p => p.id === item.promptId);
      const learning = learningPrompts.find(p => p.id === item.promptId);
      const title = item.kind === "practice" ? shortcutLabel(item, locale) : item.kind === "learning" ? learning!.title[locale] : en ? prompt!.english : prompt!.title;
      return <button className="quick-open" key={recentHref(item)} onClick={() => open(recentHref(item), item.promptId, item.kind === "learning")}>
        <strong>{title}</strong>
        {item.kind !== "learning" && <small>{item.variant === "spoken" ? (en ? "Spoken version" : "简短语音版") : (en ? "Full prompt" : "完整提示词")}{item.kind === "practice" && item.pace === "mock" ? (en ? " · Mock interview" : " · 模拟面试") : ""}{item.kind === "review" && item.source === "transcript" ? (en ? " · Another transcript" : " · 其他聊天记录") : ""}</small>}
      </button>;
    })}</div>
  </section>;
}
