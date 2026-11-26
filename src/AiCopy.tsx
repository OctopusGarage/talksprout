import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ClipboardWriter } from "./clipboard-writer";
import type { Locale } from "./types";
import { Icon } from "./Icon";

export function AiCopy({
  text,
  label,
  locale,
  writer,
  busy,
  primary = false,
  compact = false,
}: {
  text: string;
  label: string;
  locale: Locale;
  writer: ClipboardWriter;
  busy: boolean;
  primary?: boolean;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<"" | "copied" | "manual">("");
  const field = useRef<HTMLTextAreaElement>(null);
  const alive = useRef(true);
  const s = (zh: string, en: string) => (locale === "zh" ? zh : en);
  useEffect(() => {
    alive.current = true;
    setStatus("");
    return () => {
      alive.current = false;
      writer.invalidate();
    };
  }, [text, locale, writer]);
  useLayoutEffect(() => {
    if (status === "manual") {
      field.current?.focus({ preventScroll: true });
      field.current?.select();
    }
  }, [status]);
  function copy() {
    setStatus("");
    void writer.write({
      text,
      onSuccess: () => {
        if (alive.current) setStatus("copied");
      },
      onFailure: () => {
        if (alive.current) setStatus("manual");
      },
    });
  }
  return (
    <div className={`ai-copy${compact ? " ai-copy-compact" : ""}`}>
      <button
        type="button"
        className={primary ? "ai-primary" : "ai-secondary"}
        onClick={copy}
        disabled={busy}
        aria-label={label}
      >
        <span>{label}</span>
        <Icon name={status === "copied" ? "check" : "copy"} />
      </button>
      <p className="ai-copy-feedback" role="status">
        {status === "copied"
          ? s("已复制", "Copied")
          : status === "manual"
            ? s(
                "请选中文字，手动复制。",
                "Select the text and copy it manually.",
              )
            : ""}
      </p>
      {status === "manual" && (
        <textarea
          ref={field}
          readOnly
          value={text}
          aria-label={s("手动复制：", "Copy manually: ") + label}
          rows={4}
        />
      )}
    </div>
  );
}
