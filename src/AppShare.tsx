import { useEffect, useId, useRef, useState } from "react";
import type { ClipboardWriter } from "./clipboard-writer";
import type { Locale } from "./types";
import { Icon } from "./Icon";
import "./app-share.css";

/** Share the deployment home, never a practice route or private query data. */
export function AppShare({ locale, writer, copying, onMessage, placement = "header" }: {
  locale: Locale;
  writer: ClipboardWriter;
  copying: boolean;
  onMessage: (message: string) => void;
  placement?: "header" | "settings";
}) {
  const s = (zh: string, en: string) => locale === "en" ? en : zh;
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const fallbackContext = useRef("");
  const field = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  const pending = useRef(false);
  const [sharing, setSharing] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const id = useId();
  const url = new URL("./", location.href).href;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    const close = () => dialog.current?.close();
    window.addEventListener("hashchange", close);
    window.addEventListener("popstate", close);
    window.addEventListener("talksprout:navigate", close);
    return () => {
      window.removeEventListener("hashchange", close);
      window.removeEventListener("popstate", close);
      window.removeEventListener("talksprout:navigate", close);
    };
  }, []);
  useEffect(() => {
    if (!fallback) return;
    dialog.current?.showModal();
    field.current?.focus();
    field.current?.select();
  }, [fallback]);
  function showFallback() {
    fallbackContext.current = location.href;
    setFeedback("");
    setFallback(true);
  }
  function copy(inDialog = false) {
    void writer.write({ text: url,
      onSuccess: () => {
        const message = s("应用链接已复制，可以发给朋友。", "App link copied. Send it to a friend.");
        if (inDialog) setFeedback(message);
        else onMessage(message);
      },
      onFailure: () => {
        if (!inDialog) showFallback();
        setFeedback(s("请选中并手动复制应用链接。", "Select and copy the app link manually."));
        field.current?.focus();
        field.current?.select();
      },
    });
  }
  async function share() {
    if (pending.current || copying) return;
    onMessage("");
    if (typeof navigator.share !== "function") { copy(); return; }
    pending.current = true;
    setSharing(true);
    const context = location.href;
    try {
      await navigator.share({
        title: s("TalkSprout 开口芽", "TalkSprout"),
        text: s("用 TalkSprout 和 AI 开口练英语，每天进步一点。", "Practice speaking English with AI using TalkSprout, a little every day."),
        url,
      });
    } catch (error) {
      if (mounted.current && context === location.href && !(error instanceof DOMException && error.name === "AbortError")) showFallback();
    } finally {
      pending.current = false;
      if (mounted.current) setSharing(false);
    }
  }
  return <>
    <button ref={trigger} type="button" className={placement === "header" ? "icon-button app-share-button" : "settings-row"}
      aria-label={placement === "header" ? s("分享应用", "Share app") : s("分享 TalkSprout", "Share TalkSprout")}
      title={s("分享 TalkSprout", "Share TalkSprout")} disabled={sharing || copying} onClick={() => void share()}>
      {placement === "header" ? <Icon name="share" /> : <>
        <span className="entry-icon"><Icon name="share" /></span>
        <span className="row-text"><strong>{s("分享 TalkSprout", "Share TalkSprout")}</strong><small>{s("推荐给朋友，一起开口练英语", "Invite friends to practice English")}</small></span>
        <Icon name="chevron" />
      </>}
    </button>
    {fallback && <dialog ref={dialog} className="app-share-dialog" onClose={() => {
      writer.invalidate();
      setFallback(false);
      if (fallbackContext.current === location.href) trigger.current?.focus({ preventScroll: true });
    }} aria-labelledby={`${id}-title`}>
      <div className="app-share-heading"><h2 id={`${id}-title`}>{s("分享 TalkSprout", "Share TalkSprout")}</h2>
        <button type="button" className="icon-button" aria-label={s("关闭", "Close")} onClick={() => dialog.current?.close()}><Icon name="close" /></button></div>
      <p>{s("把开口芽推荐给朋友，用 AI 开口练英语。", "Invite a friend to practice speaking English with AI.")}</p>
      <label htmlFor={`${id}-link`}>{s("应用首页链接", "App home link")}</label>
      <input ref={field} id={`${id}-link`} readOnly value={url} onFocus={event => event.currentTarget.select()} />
      <button type="button" className="app-share-copy" disabled={copying} onClick={() => copy(true)}>{s("复制应用链接", "Copy app link")}</button>
      <p role="status">{feedback}</p>
    </dialog>}
  </>;
}
