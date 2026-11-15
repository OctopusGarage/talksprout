import { useEffect, useRef, useState } from "react";
import type { ClipboardWriter } from "./clipboard-writer";
import type { Locale } from "./types";
import { Icon } from "./Icon";
import { AppShareDialog } from "./AppShareDialog";
import "./app-share.css";

export function AppShare({ locale, writer, copying, onMessage, placement = "header" }: {
  locale: Locale;
  writer: ClipboardWriter;
  copying: boolean;
  onMessage: (message: string) => void;
  placement?: "header" | "settings";
}) {
  const s = (zh: string, en: string) => locale === "en" ? en : zh;
  const trigger = useRef<HTMLButtonElement>(null);
  const origin = useRef("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    window.addEventListener("popstate", close);
    window.addEventListener("talksprout:navigate", close);
    return () => {
      window.removeEventListener("hashchange", close);
      window.removeEventListener("popstate", close);
      window.removeEventListener("talksprout:navigate", close);
    };
  }, []);
  function close() {
    writer.invalidate();
    setOpen(false);
    if (origin.current === location.href) trigger.current?.focus({ preventScroll: true });
  }
  return <>
    <button ref={trigger} type="button" className={placement === "header" ? "icon-button app-share-button" : "settings-row"}
      aria-label={placement === "header" ? s("分享应用", "Share app") : s("分享 TalkSprout", "Share TalkSprout")}
      title={s("分享 TalkSprout", "Share TalkSprout")} onClick={() => { origin.current = location.href; onMessage(""); setOpen(true); }}>
      {placement === "header" ? <Icon name="share" /> : <>
        <span className="entry-icon"><Icon name="share" /></span>
        <span className="row-text"><strong>{s("分享 TalkSprout", "Share TalkSprout")}</strong><small>{s("复制链接或生成二维码卡片", "Copy a link or create a QR card")}</small></span>
        <Icon name="chevron" />
      </>}
    </button>
    {open && <AppShareDialog locale={locale} writer={writer} copying={copying} onClose={close} />}
  </>;
}
