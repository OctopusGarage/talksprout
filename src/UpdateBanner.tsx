import type { Locale } from "./types";
import type { AppUpdateSnapshot } from "./app-update";

export function UpdateBanner({
  snapshot,
  completed,
  locale,
  onUpdate,
}: {
  snapshot: AppUpdateSnapshot;
  completed: boolean;
  locale: Locale;
  onUpdate: () => void;
}) {
  const { phase } = snapshot;
  if (phase === "idle" && !completed) return null;
  const s = (zh: string, en: string) => (locale === "en" ? en : zh);
  const busy = phase === "applying" || phase === "reloading";
  const failed = phase === "stalled" || phase === "error";
  const done = phase === "idle" && completed;
  const title = done
    ? s("更新完成", "App updated")
    : busy
      ? s("正在更新…", "Updating…")
      : failed
        ? s("更新暂未完成", "Update not completed")
        : s("新版本已就绪", "An update is ready");
  const description = done
    ? s("已重新打开，可以继续练习。", "Reopened and ready to practice.")
    : busy
      ? s("完成后会自动重新打开。", "The app will reopen automatically.")
      : failed
        ? s(
            "请重试，或关闭 App 后重新打开。",
            "Try again, or close and reopen the app.",
          )
        : s(
            "重新打开即可使用，收藏与语言设置会保留。",
            "Reopen to use it. Saved prompts and language stay.",
          );
  return (
    <div
      id="update-bar"
      className={`app-banner update-banner${failed ? " update-stalled" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        className={busy ? "update-spinner" : "update-symbol"}
        aria-hidden="true"
      >
        {busy ? "" : done ? "✓" : failed ? "!" : "↻"}
      </span>
      <span className="update-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      {!done && (
        <button
          id="update"
          type="button"
          disabled={busy}
          aria-busy={busy}
          onClick={onUpdate}
        >
          {busy
            ? s("请稍候", "Please wait")
            : failed
              ? s("重试更新", "Retry update")
              : s("立即更新", "Update now")}
        </button>
      )}
    </div>
  );
}
