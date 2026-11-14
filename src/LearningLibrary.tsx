import { useLayoutEffect, useRef, useState } from "react";
import { learningGroups, learningPrompts, type LearningSkill } from "./content/learning";
import { navigate } from "./navigation";
import { PromptDialog } from "./PromptDialog";
import { Icon } from "./Icon";
import { learningPromptText } from "./prompt-text";
import { RecentList } from "./QuickAccess";
import type { ClipboardWriter } from "./clipboard-writer";
import type { RecentPrompt } from "./shortcuts";
import "./learning-library.css";
import type { Locale } from "./types";

interface Props {
  locale: Locale;
  promptId: string | null;
  copying: boolean;
  writer: ClipboardWriter;
  favorites: string[];
  recent: RecentPrompt[];
  onFavorite: (id: string) => void;
  onDelivered: (id: string) => boolean;
}

export function LearningLibrary({ locale, promptId, copying, writer, favorites, recent, onFavorite, onDelivered }: Props) {
  const en = locale === "en";
  const selected = learningPrompts.find((p) => p.id === promptId);
  const [skill, setSkill] = useState<LearningSkill>(selected?.skill ?? "listening");
  const [copied, setCopied] = useState(false);
  const [manual, setManual] = useState(false);
  const [message, setMessage] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const text = useRef<HTMLTextAreaElement>(null);
  const group = learningGroups.find((item) => item.id === skill)!;
  const visiblePrompts = learningPrompts.filter((p) => p.skill === skill && (!savedOnly || favorites.includes(p.id)));

  useLayoutEffect(() => {
    if (selected) setSkill(selected.skill);
  }, [selected]);
  useLayoutEffect(() => {
    writer.invalidate();
    setCopied(false);
    setManual(false);
    setMessage("");
    return () => { writer.invalidate(); };
  }, [promptId, locale, writer]);
  useLayoutEffect(() => {
    if (manual) {
      text.current?.focus();
      text.current?.select();
    }
  }, [manual]);

  const close = () => {
    writer.invalidate();
    if (history.state?.talksproutLearningPrompt === promptId) history.back();
    else navigate("#learning");
  };
  const copy = async () => {
    if (!selected || copying) return;
    setCopied(false);
    setManual(false);
    setMessage("");
    let persisted = true;
    await writer.write({
      text: learningPromptText(selected, locale),
      onDelivered: () => { persisted = onDelivered(selected.id); },
      onSuccess: () => {
        setCopied(true);
        setMessage((en ? "Copied! Paste into your AI with the material." : "已复制！粘贴到常用 AI，并提供相关材料。") +
          (persisted ? "" : en ? " Recent history could not be saved on this device." : " 最近复制记录未能保存在本机。"));
      },
      onFailure: () => {
        setManual(true);
        setMessage(en ? "Copy unavailable. Select and copy the prompt manually." : "自动复制不可用，请手动复制已选中的提示词。");
      },
    });
  };

  return (
    <section className="learning-library" aria-label={en ? "Extra learning prompts" : "辅助学习提示词"}>
      <p className="view-caption">
        {en ? "Something hard to follow or put into words? Pick a task and take it to your AI." : "听不懂、读不透、写不顺？选一个需求，带去常用 AI。"}
      </p>
      <div className="learning-directions" role="group" aria-label={en ? "Learning direction" : "学习方向"}>
        {learningGroups.map((item) => (
          <button
            key={item.id}
            aria-pressed={skill === item.id}
            onClick={() => setSkill(item.id)}
          >
            <span className="direction-emoji" aria-hidden="true">{item.emoji}</span>
            <strong>{item.title[locale]}</strong>
          </button>
        ))}
      </div>
      <RecentList items={recent} locale={locale} />
      <button className="learning-saved-filter" aria-label={en ? "Saved only" : "只看收藏"} aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}>
        <Icon name="heart" />{en ? "Saved only" : "只看收藏"}
      </button>
      <section className={`learning-group learning-${skill}`} aria-labelledby="learning-group-title">
        <div className="learning-group-heading">
          <h2 className="section-label" id="learning-group-title">{group.title[locale]}</h2>
          <span>{en ? `${visiblePrompts.length} prompts` : `${visiblePrompts.length} 个提示词`}</span>
        </div>
        <p className="learning-group-description">{group.description[locale]}</p>
        <div className="native-list learning-list">
          {visiblePrompts.length === 0 && <p className="learning-empty">{en ? "No saved prompts in this direction yet." : "这个方向还没有收藏的提示词。"}</p>}
          {visiblePrompts.map((p) => (
            <div className="learning-prompt-row" key={p.id}>
            <button
              className="learning-prompt"
              key={p.id}
              data-learning-prompt={p.id}
              onClick={() => navigate(`#learning?prompt=${p.id}`, { talksproutLearningPrompt: p.id })}
            >
              <span className="learning-prompt-emoji" aria-hidden="true">{p.emoji}</span>
              <span className="learning-prompt-text">
                <strong>{p.title[locale]}</strong>
                <small>{p.description[locale]}</small>
                <span className="learning-examples">{p.examples[locale]}</span>
              </span>
              <Icon name="chevron" />
            </button>
            <button className="learning-favorite icon-button" aria-label={`${favorites.includes(p.id) ? (en ? "Unsave" : "取消收藏") : (en ? "Save" : "收藏")}：${p.title[locale]}`} aria-pressed={favorites.includes(p.id)} onClick={() => onFavorite(p.id)}>
              <Icon name="heart" />
            </button>
            </div>
          ))}
        </div>
      </section>
      <p className="section-note">{en ? "Copy → paste into your AI → provide the material there. No uploads needed here." : "复制 → 粘贴给 AI → 在那里提供材料，这里无需上传。"}</p>
      {selected && (
        <PromptDialog
          key={selected.id}
          locale={locale}
          prompt={null}
          message=""
          manual={false}
          copied={false}
          copying={false}
          onClose={close}
          onCopy={() => {}}
          content={<>
            <h2 id="dialog-title" className="learning-detail-title">
              <span aria-hidden="true">{selected.emoji}</span>{selected.title[locale]}
            </h2>
            <p>{selected.description[locale]}</p>
            <p className="learning-detail-examples">{selected.examples[locale]}</p>
            <p className="requirement"><strong>{en ? "Preparation: " : "准备："}</strong>{selected.preparation[locale]}</p>
            <p>{selected.guide[locale]}</p>
            <label htmlFor="prompt-text">{en ? "English prompt" : "英文提示词"}</label>
            <textarea id="prompt-text" ref={text} value={learningPromptText(selected, locale)} readOnly lang="en" spellCheck={false} />
          </>}
          footer={<footer className="sheet-footer">
            <button className="primary modal-copy learning-copy" disabled={copying} aria-busy={copying} onClick={() => void copy()}>
              <Icon name="copy" />
              {copying ? (en ? "Copying…" : "正在复制…") : copied ? (en ? "Copied ✓" : "已复制 ✓") : (en ? "Copy prompt" : "复制提示词")}
            </button>
            <p role={manual ? "alert" : "status"} aria-live="polite" className={manual ? "manual-note" : ""}>{message}</p>
          </footer>}
        />
      )}
    </section>
  );
}
