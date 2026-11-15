import { useEffect, useId, useRef, useState } from "react";
import type { ClipboardWriter } from "./clipboard-writer";
import type { Locale } from "./types";
import type { ShareCardCopy } from "./share-card";
import { Icon } from "./Icon";

interface Card { src: string; file: File; copy: ShareCardCopy }
function fileShareSupported(file: File): boolean {
  try { return typeof navigator.canShare === "function" && navigator.canShare({ files: [file] }); }
  catch { return false; }
}

export function AppShareDialog({ locale, writer, copying, onClose }: {
  locale: Locale;
  writer: ClipboardWriter;
  copying: boolean;
  onClose: () => void;
}) {
  const s = (zh: string, en: string) => locale === "en" ? en : zh;
  const dialog = useRef<HTMLDialogElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const alive = useRef(true);
  const pending = useRef(false);
  const [sharing, setSharing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [card, setCard] = useState<Card | null>(null);
  const [cardError, setCardError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const id = useId();
  const url = new URL("./", location.href).href;
  useEffect(() => {
    alive.current = true;
    const element = dialog.current!;
    element.showModal();
    return () => { alive.current = false; writer.invalidate(); element.close(); };
  }, [writer]);
  useEffect(() => {
    let disposed = false;
    let objectUrl: string | undefined;
    setCard(null);
    setCardError(false);
    setFeedback("");
    void import("./share-card").then(async module => {
      const blob = await module.renderShareCard(url, locale);
      if (disposed) return;
      objectUrl = URL.createObjectURL(blob);
      setCard({ src: objectUrl, file: new File([blob], `talksprout-share-${locale}.png`, { type: "image/png" }), copy: module.shareCardCopy[locale] });
    }).catch(() => { if (!disposed) setCardError(true); });
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url, locale, attempt]);

  function close() {
    dialog.current?.close();
    onClose();
  }
  function copy() {
    setFeedback("");
    void writer.write({ text: url,
      onSuccess: () => { if (alive.current) setFeedback(s("应用链接已复制，可以发给朋友。", "App link copied. Send it to a friend.")); },
      onFailure: () => {
        if (!alive.current) return;
        setFeedback(s("请选中并手动复制应用链接。", "Select and copy the app link manually."));
        field.current?.focus(); field.current?.select();
      },
    });
  }
  async function share(file?: File) {
    if (pending.current) return;
    pending.current = true;
    setSharing(true);
    setFeedback("");
    try {
      // Files are already generated, so the native call stays in the click gesture.
      await navigator.share(file ? { files: [file], title: "TalkSprout" } : {
        title: s("TalkSprout 开口芽", "TalkSprout"),
        text: s("用 TalkSprout 和 AI 开口练英语，每天进步一点。", "Practice speaking English with AI using TalkSprout, a little every day."),
        url,
      });
    } catch (error) {
      if (alive.current && !(error instanceof DOMException && error.name === "AbortError")) {
        setFeedback(file ? s("图片未能分享，请下载卡片后发送，或长按预览图查看存储选项。", "Could not share the image. Download the card to send it, or touch and hold its preview for save options.") : s("无法打开系统分享，请复制应用链接。", "Could not open system sharing. Copy the app link instead."));
      }
    } finally {
      pending.current = false;
      if (alive.current) setSharing(false);
    }
  }
  return <dialog ref={dialog} className="app-share-dialog" aria-labelledby={`${id}-title`} onCancel={event => { event.preventDefault(); close(); }}>
    <div className="app-share-heading"><div><span className="app-share-eyebrow">TalkSprout</span><h2 id={`${id}-title`}>{s("分享 TalkSprout", "Share TalkSprout")}</h2></div>
      <button type="button" className="icon-button" aria-label={s("关闭", "Close")} onClick={close}><Icon name="close" /></button></div>
    <p className="app-share-intro">{s("发一个链接，或把这张开口芽卡片送给朋友。", "Send a link, or pass this little invitation to a friend.")}</p>
    <div className="app-share-link-actions">
      {typeof navigator.share === "function" && <button type="button" className="app-share-primary" disabled={sharing} onClick={() => void share()}>{s("分享应用链接", "Share app link")}</button>}
      <button type="button" className="app-share-secondary" disabled={copying} onClick={copy}>{s("复制应用链接", "Copy app link")}</button>
    </div>
    <label className="app-share-link-label" htmlFor={`${id}-link`}>{s("应用首页链接", "App home link")}</label>
    <input ref={field} id={`${id}-link`} readOnly value={url} onFocus={event => event.currentTarget.select()} />
    <p className="app-share-feedback" role="status">{feedback}</p>
    <section className="app-share-card-section" aria-labelledby={`${id}-card-title`}>
      <h3 id={`${id}-card-title`}>{s("二维码分享卡片", "QR sharing card")}</h3>
      {!card && !cardError && <p role="status">{s("正在生成卡片…", "Creating your card…")}</p>}
      {cardError && <div className="app-share-card-error"><p role="status">{s("卡片暂未生成，你仍可复制链接分享。", "The card could not be created. You can still share the link.")}</p><button type="button" className="app-share-secondary" onClick={() => setAttempt(value => value + 1)}>{s("重新生成卡片", "Retry creating card")}</button></div>}
      {card && <>
        <div className="app-share-card-actions">
          {typeof navigator.share === "function" && fileShareSupported(card.file) && <button type="button" className="app-share-primary" disabled={sharing} onClick={() => void share(card.file)}>{s("分享卡片图片", "Share card image")}</button>}
          <a className="app-share-secondary" href={card.src} download={card.file.name}>{s("下载分享卡片", "Download share card")}</a>
        </div>
        <p className="app-share-save-hint">{s("iPhone：也可长按预览图，查看可用的存储选项。下载 PNG 不会自动加入「照片」。", "On iPhone, you can also touch and hold the preview for available save options. A PNG download is not automatically added to Photos.")}</p>
        <img className="app-share-preview" src={card.src} width="1080" height="1800" alt={s("TalkSprout 二维码分享卡片，包含应用首页网址和 iPhone 打开指引", "TalkSprout QR sharing card with the app home address and iPhone opening instructions")} />
        <details className="app-share-opening" open><summary>{card.copy.instructionsTitle}</summary>
          <dl><dt>{card.copy.otherScreen.title}</dt><dd>{card.copy.otherScreen.body}</dd><dt>{card.copy.samePhone.title}</dt><dd>{card.copy.samePhone.body}</dd></dl>
          <p>{card.copy.fallback}</p><a href={url}>{url}</a>
        </details>
      </>}
    </section>
  </dialog>;
}
