import { useRef, useState, useLayoutEffect } from "react";
import { handbookArticles, guideGroups, guideTopics } from "./content/guides";
import type { HandbookArticle, GuideShelf, GuideTopic, GuidePrompt } from "./content/guide-types";
import type { Locale } from "./types";
import { filterGuides, guideEntryId, guidePracticeHref } from "./guides";
import { navigate } from "./navigation";
import { Icon } from "./Icon";
import type { ClipboardWriter } from "./clipboard-writer";
import "./guides.css";

export function GuideLibrary({ locale, guideId, shelf = "practice", writer, copying }: { locale: Locale; guideId?: string; shelf?: GuideShelf; writer: ClipboardWriter; copying: boolean }) {
  const en = locale === "en";
  const article = handbookArticles.find(item => item.id === guideId);
  const activeShelf = article?.shelf ?? shelf;
  const reading = activeShelf === "reading";
  const [filters, setFilters] = useState<Record<GuideShelf, { query: string; topic: GuideTopic | "all" }>>({ practice: { query: "", topic: "all" }, reading: { query: "", topic: "all" } });
  const { query, topic } = filters[activeShelf];
  const update = (changes: { query?: string; topic?: GuideTopic | "all" }) => setFilters(old => ({ ...old, [activeShelf]: { ...old[activeShelf], ...changes } }));
  const matches = filterGuides(handbookArticles.filter(article => article.shelf === activeShelf), query, topic);
  const back = () => {
    if (history.state?.talksproutGuide === guideId) history.back();
    else navigate(reading ? "#guides?section=reading" : "#guides");
  };
  return <>
    <section className="guide-hub" hidden={guideId !== undefined} aria-label={en ? "Learning guides" : "学习指南"}>
      <div className="guide-shelves" role="group" aria-label={en ? "Guide collections" : "指南栏目"}>
        <button aria-pressed={!reading} onClick={() => navigate("#guides")}>{en ? "Companion guides" : "配套指南"}</button>
        <button aria-pressed={reading} onClick={() => navigate("#guides?section=reading")}>{en ? "Further resources" : "扩展资料"}</button>
      </div>
      <p className="view-caption">{reading ? (en ? "Learning methods and AI techniques to read and use independently." : "阅读完整学习方法，配置不同方式的 AI 英语练习。") : (en ? "Choose and use the practice tools for your current task." : "按当前任务，了解本站练习工具怎么选、怎么用。")}</p>
      <label className="search guide-search">
        <Icon name="search" />
        <input type="search" aria-label={en ? "Search learning guides" : "搜索学习指南"} placeholder={en ? "Search guide content" : "搜索指南内容"} value={query} onChange={event => update({ query: event.target.value })} />
      </label>
      <div className="guide-topics" role="group" aria-label={en ? "Guide topics" : "指南分类"}>
        <button aria-pressed={topic === "all"} onClick={() => update({ topic: "all" })}>{en ? "All" : "全部"}</button>
        {guideTopics[activeShelf].map(item => <button key={item.id} aria-pressed={topic === item.id} onClick={() => update({ topic: item.id })}>{item.title[locale]}</button>)}
      </div>
      {(query.trim() || topic !== "all") && <div className="guide-results">
        <p role="status">{matches.length} {en ? "articles" : "篇文章"}</p>
        <button onClick={() => update({ query: "", topic: "all" })}>{en ? "Clear filters" : "清除筛选"}</button>
      </div>}
      {guideGroups.filter(group => group.shelf === activeShelf).map(group => {
        const entries = matches.filter(item => item.group === group.id);
        if (!entries.length) return null;
        return <section className="guide-group" key={group.id} aria-labelledby={`guide-group-${group.id}`}>
          <h2 id={`guide-group-${group.id}`}>{group.title[locale]}</h2>
          <div className="guide-list native-list">
            {entries.map(item => <button className="guide-entry" id={guideEntryId(item.id)} key={item.id} onClick={() => navigate(`#guides/${item.id}`, { talksproutGuide: item.id })}>
              <span className="guide-entry-text"><strong>{item.title[locale]}</strong><span>{item.summary[locale]}</span></span>
              <Icon name="chevron" />
            </button>)}
          </div>
        </section>;
      })}
      {!matches.length && <div className="empty">
        <h2>{en ? "No matching articles" : "没有找到匹配的文章"}</h2>
        <p>{en ? "Try another word or clear the search." : "换个关键词，或清除搜索。"}</p>
      </div>}
    </section>
    {guideId !== undefined && <>
      <button className="guide-back" onClick={back}><Icon name="back" />{reading ? (en ? "Back to further resources" : "返回扩展资料") : (en ? "Back to companion guides" : "返回配套指南")}</button>
      {article ? <GuideReader key={`${article.id}-${locale}`} article={article} locale={locale} writer={writer} copying={copying} /> : <div className="empty">
        <h2>{en ? "Article not found" : "没有找到这篇文章"}</h2>
        <p>{en ? "Return to the directory to choose another article." : "请返回学习指南重新选择。"}</p>
      </div>}
    </>}
  </>;
}

function GuideReader({ article, locale, writer, copying }: { article: HandbookArticle; locale: Locale; writer: ClipboardWriter; copying: boolean }) {
  const en = locale === "en";
  return <article className="guide-reader" aria-labelledby="library-heading">
    <p className="guide-summary">{article.summary[locale]}</p>
    {article.sections.map(section => <section className="guide-section" key={section.id} aria-labelledby={`guide-section-${section.id}`}>
      <h2 id={`guide-section-${section.id}`}>{section.title[locale]}</h2>
      {section.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph[locale]}</p>)}
      {section.steps && <ol>{section.steps.map((step, index) => <li key={index}>{step[locale]}</li>)}</ol>}
      {section.example && <div className="guide-example"><strong>{en ? "Example" : "示例"}</strong><p lang="en">{section.example}</p></div>}
      {section.prompt && <GuidePromptBlock prompt={section.prompt} locale={locale} writer={writer} copying={copying} />}
    </section>)}
    {article.practice?.length ? <section className="guide-practice">
      <h2>{en ? "Related practice tools" : "对应练习工具"}</h2>
      <p>{en ? "Open the tool and send its prompt to your AI. For review, use the conversation where you practised." : "打开工具，再把提示词交给常用 AI；复习时回到有练习记录的对话。"}</p>
      <div>{article.practice.map(practice => <a key={practice.promptId} href={guidePracticeHref(practice.promptId)} onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate(guidePracticeHref(practice.promptId)); }}>{practice.label[locale]}<Icon name="chevron" /></a>)}</div>
    </section> : null}
  </article>;
}

function GuidePromptBlock({ prompt, locale, writer, copying }: { prompt: GuidePrompt; locale: Locale; writer: ClipboardWriter; copying: boolean }) {
  const en = locale === "en";
  const text = useRef<HTMLTextAreaElement>(null);
  const preview = useRef<HTMLDetailsElement>(null);
  const [status, setStatus] = useState<"idle" | "copied" | "manual">("idle");
  useLayoutEffect(() => () => { writer.invalidate(); }, [writer]);
  const copy = () => {
    if (copying) return;
    setStatus("idle");
    void writer.write({
      text: prompt.body,
      onSuccess: () => setStatus("copied"),
      onFailure: () => {
        setStatus("manual");
        if (preview.current) preview.current.open = true;
        text.current?.focus();
        text.current?.select();
      },
    });
  };
  return <div className="guide-prompt" role="group" aria-labelledby={`guide-prompt-${prompt.id}`}>
    <div className="guide-prompt-heading">
      <h3 id={`guide-prompt-${prompt.id}`}>{prompt.title[locale]}</h3>
      <button className="guide-copy" disabled={copying} onClick={copy}>{en ? "Copy prompt" : "复制提示词"}</button>
    </div>
    <details ref={preview} className="guide-prompt-preview">
      <summary>{en ? "View instructions" : "查看指令"}</summary>
      <textarea ref={text} readOnly lang="en" aria-label={en ? `${prompt.title.en} prompt` : `${prompt.title.zh}提示词`} rows={Math.min(18, prompt.body.split("\n").length + 2)} value={prompt.body} spellCheck={false} />
    </details>
    <p className="guide-copy-status" role="status">{status === "copied" ? (en ? "Copied. Paste into your AI." : "已复制，粘贴到常用 AI 即可。") : status === "manual" ? (en ? "Copy unavailable. Select and copy the prompt manually." : "自动复制不可用，请手动复制已选中的提示词。") : ""}</p>
  </div>;
}
