import { useEffect, useRef, type ReactNode } from "react";
import { ScenarioPicker } from "./ScenarioPicker";
import type { SceneSelection } from "./scenes";
import { Icon } from "./Icon";
import { promptText } from "./prompt-text";
import { dictionary, metadata, categoryEnglish, type Locale } from "./i18n";
import type { Prompt, PromptVariant, ReviewSource } from "./types";
export function PromptDialog({
  prompt: p,
  content,
  message,
  manual,
  copied,
  copying,
  onClose,
  onCopy,
  locale,
  variant = "full",
  onVariantChange,
  reviewSource = "current",
  onSourceChange,
  sceneSelection,
  onSceneChange,
  footer,
  practiceActions,
}: {
  footer?: ReactNode;
  practiceActions?: ReactNode;
  sceneSelection?: SceneSelection;
  onSceneChange?: (selection?: SceneSelection) => void;
  locale: Locale;
  prompt: Prompt | null;
  content: ReactNode;
  message: string;
  manual: boolean;
  copied: boolean;
  copying: boolean;
  onClose: () => void;
  onCopy: (p: Prompt, variant: PromptVariant) => void;
  reviewSource?: ReviewSource;
  onSourceChange?: (source: ReviewSource) => void;
  variant?: PromptVariant;
  onVariantChange?: (variant: PromptVariant) => void;
}) {
  const en = locale === "en",
    t = dictionary[locale],
    s = (zh: string, english: string) => (en ? english : zh);
  const reviewing = p?.kind === "review";
  const spokenLabel = reviewing
    ? s("语音结尾提示", "Spoken wrap-up")
    : s("语音开场白", "Spoken opening");
  const selectedText = p ? promptText(p, variant, reviewSource, locale) : "";
  const ref = useRef<HTMLDialogElement>(null);
  const text = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const d = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const originBase = location.hash.split("?")[0];
    d.showModal();
    return () => {
      d.close();
      requestAnimationFrame(() => {
        if (document.querySelector("dialog[open]") || location.hash.split("?")[0] !== originBase) return;
        const focused = document.activeElement;
        if (focused !== document.body && focused?.isConnected && focused !== previous) return;
        if (previous?.isConnected) previous.focus({ preventScroll: true });
        else
          document
            .querySelector<HTMLElement>("#library-heading")
            ?.focus({ preventScroll: true });
      });
    };
  }, []);
  useEffect(() => {
    if (manual) {
      text.current?.focus();
      text.current?.select();
    }
  }, [manual, p, variant, reviewSource]);
  return (
    <dialog
      id="detail"
      className="prompt-sheet"
      ref={ref}
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          onClose();
      }}
    >
      <header className="sheet-toolbar">
        {p ? (
          <div>
            <div className="eyebrow">
              {en ? categoryEnglish[p.category] : p.category}
              {p.kind !== "review" && ` · ${p.level}`}
            </div>
            <h2 id="dialog-title">{en ? p.english : p.title}</h2>
          </div>
        ) : (
          <span className="sheet-brand">TalkSprout</span>
        )}
        <button
          className="modal-close icon-button"
          aria-label={t.close}
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </header>
      <div className="sheet-content">
        {p ? (
          <>
            {!en && <p className="english-title">{p.english}</p>}
            {onSceneChange && (
              <ScenarioPicker
                key={p.id}
                prompt={p}
                locale={locale}
                selection={sceneSelection}
                onChange={onSceneChange}
              />
            )}
            {practiceActions}
            <div
              className="prompt-formats"
              role="tablist"
              aria-label={s("使用方式", "Prompt format")}
              onKeyDown={(event) => {
                let next: PromptVariant;
                if (event.key === "Home") next = "full";
                else if (event.key === "End") next = "spoken";
                else if (
                  event.key === "ArrowRight" ||
                  event.key === "ArrowLeft"
                )
                  next = variant === "full" ? "spoken" : "full";
                else return;
                event.preventDefault();
                onVariantChange?.(next);
                document.getElementById(`format-${next}`)?.focus();
              }}
            >
              <button
                role="tab"
                id="format-full"
                tabIndex={variant === "full" ? 0 : -1}
                aria-selected={variant === "full"}
                aria-controls="prompt-panel"
                onClick={() => onVariantChange?.("full")}
              >
                {s("完整提示词", "Full prompt")}
              </button>
              <button
                role="tab"
                id="format-spoken"
                tabIndex={variant === "spoken" ? 0 : -1}
                aria-selected={variant === "spoken"}
                aria-controls="prompt-panel"
                onClick={() => onVariantChange?.("spoken")}
              >
                {spokenLabel}
              </button>
            </div>
            <section
              id="prompt-panel"
              role="tabpanel"
              aria-labelledby={
                variant === "spoken" ? "format-spoken" : "format-full"
              }
            >
              {variant === "full" ? (
                <>
                  <p>{metadata(p, "description", locale)}</p>
                  <div className="modal-facts">
                    {p.kind !== "review" && (
                      <span>
                        {s("建议 ", "Suggested ")}
                        {p.minutes}
                        {s(" 分钟", " min")}
                      </span>
                    )}
                    <span>{metadata(p, "feedback", locale)}</span>
                  </div>
                  <details className="usage-guide">
                    <summary>
                      {reviewing
                        ? s("怎么用", "How to use")
                        : s("怎么练", "How to practice")}
                    </summary>
                    <p>{metadata(p, "guide", locale)}</p>
                    <p className="requirement">
                      {s("准备：", "Preparation: ")}
                      {metadata(p, "requires", locale)}
                    </p>
                  </details>
                </>
              ) : (
                <>
                  <p>
                    {reviewing
                      ? s(
                          "聊天结束时，在原来的 AI 语音对话里念下面这段英文。优先请求书面材料；只能语音回复时，改为简短口头复盘。",
                          "Read this in your existing AI voice chat when practice ends. Request written material if available; otherwise, use a brief spoken recap.",
                        )
                      : s(
                          "不方便粘贴时，在 AI 语音对话开始时照着念下面这段英文，念完后等 AI 提问。",
                          "If you cannot paste text, read this aloud at the start of your AI voice conversation, then let the AI begin.",
                        )}
                  </p>
                  <p className="spoken-duration">
                    {s("朗读约 ", "About ")}
                    {Math.ceil(
                      ((selectedText.trim().split(/\s+/).length / 140) * 60) /
                        5,
                    ) * 5}
                    –
                    {Math.ceil(
                      ((selectedText.trim().split(/\s+/).length / 100) * 60) /
                        5,
                    ) * 5}
                    {s(
                      " 秒，因语速而异",
                      " seconds to read, depending on pace",
                    )}
                  </p>
                </>
              )}
              {reviewing && variant === "full" && (
                <div className="review-source">
                  <label htmlFor="review-source">
                    {s("整理哪段聊天", "Conversation source")}
                  </label>
                  <select
                    id="review-source"
                    value={reviewSource}
                    onChange={(event) =>
                      onSourceChange?.(event.target.value as ReviewSource)
                    }
                  >
                    <option value="current">
                      {s("当前 AI 聊天", "Current AI chat")}
                    </option>
                    <option value="transcript">
                      {s("其他聊天记录", "Another transcript")}
                    </option>
                  </select>
                  <p>
                    {reviewSource === "transcript"
                      ? s(
                          "复制后，先将模板末尾的占位文字替换为聊天记录（注明说话人），再发给 AI。本站不读取聊天记录。",
                          "After copying, replace the placeholder at the end with a speaker-labeled transcript before sending. This site does not read your conversations.",
                        )
                      : s(
                          "在原来的 AI 聊天中发送。AI 只能整理它当前能读取的内容，无法找回已丢失的上下文。",
                          "Send in your original AI chat. The AI can review only the context it still has access to.",
                        )}
                  </p>
                </div>
              )}
              {variant === "full" || manual ? (
                <>
                  <label htmlFor="prompt-text">
                    {variant === "spoken"
                      ? spokenLabel
                      : s("完整英文提示词", "Full English prompt")}
                  </label>
                  <textarea
                    id="prompt-text"
                    ref={text}
                    readOnly
                    lang="en"
                    spellCheck={false}
                    value={selectedText}
                  />
                </>
              ) : (
                <div
                  className="spoken-script"
                  lang="en"
                  aria-label={spokenLabel}
                >
                  {selectedText.split("\n").map((sentence, i) => (
                    <p key={i}>{sentence}</p>
                  ))}
                </div>
              )}
            </section>
            <p className="fineprint">
              {reviewing
                ? s(
                    "在已有对话结束后使用。本站只提供提示词，不接收或保存 AI 聊天。",
                    "Use after an existing conversation. This site provides prompts; it does not receive or store AI chats.",
                  )
                : variant === "spoken"
                  ? s(
                      "在 AI 语音对话开始时，照着上面的英文念一遍，再等待 AI 回应。",
                      "Read the English opening aloud when your AI voice conversation starts, then wait for its reply.",
                    )
                  : s(
                      "粘贴到常用 AI，按练习模式开启语音或文字对话。本站不接收或保存 AI 聊天。",
                      "Paste into your AI and start by voice or text. This site does not store AI conversations.",
                    )}
            </p>
            {!reviewing && (
              <details className="chat-tips">
                <summary>
                  {s(
                    "和 AI 聊天时，可以这样说",
                    "Things you can say to your AI",
                  )}
                </summary>
                <p>
                  {s(
                    "开始练习后，在你使用的 AI 聊天里，直接用英文说：",
                    "Once practice starts, say these phrases in your AI chat:",
                  )}
                </p>
                <dl>
                  <div>
                    <dt lang="en">Help, please.</dt>
                    <dd>
                      {s(
                        "不知道怎么表达时，请 AI 给一个英文示例或简短提示。",
                        "Ask for a short hint or an English example when you get stuck.",
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt lang="en">Review, please.</dt>
                    <dd>
                      {s(
                        "请 AI 回顾刚才练过的表达和需要改进的地方。",
                        "Ask the AI to recap expressions you practiced and useful improvements.",
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt lang="en">Let's finish.</dt>
                    <dd>
                      {s(
                        "告诉 AI 今天先聊到这里，请它做一个简短总结。",
                        "Tell the AI you want to stop and get a short summary.",
                      )}
                    </dd>
                  </div>
                </dl>
              </details>
            )}
          </>
        ) : (
          content
        )}
      </div>
      {footer}
      {p && (
        <footer className="sheet-footer">
          {" "}
          <button
            className="primary modal-copy"
            data-copy={p.id}
            data-variant={variant}
            disabled={copying}
            aria-busy={copying}
            onClick={() => onCopy(p, variant)}
          >
            {copying
              ? s("正在复制…", "Copying…")
              : copied && !manual
                ? s("已复制 ✓", "Copied ✓")
                : variant === "spoken"
                  ? reviewing
                    ? s("复制语音结尾提示", "Copy spoken wrap-up")
                    : s("复制语音开场白", "Copy spoken opening")
                  : s("复制完整提示词", "Copy full prompt")}
          </button>
          <p
            role={manual ? "alert" : "status"}
            aria-live="polite"
            className={manual ? "manual-note" : ""}
          >
            {message}
          </p>
        </footer>
      )}
    </dialog>
  );
}
