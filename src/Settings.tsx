import type { OfflineStatus } from "./offline-readiness";
import { Icon } from "./Icon";
import type { Locale } from "./types";
export function Settings({
  locale,
  onLocale,
  onInstall,
  onAbout,
  online,
  installed,
  offlineStatus,
}: {
  locale: Locale;
  onLocale: (locale: Locale) => void;
  onInstall: () => void;
  onAbout: () => void;
  online: boolean;
  installed: boolean;
  offlineStatus: OfflineStatus;
}) {
  const en = locale === "en",
    s = (zh: string, english: string) => (en ? english : zh);
  return (
    <section
      className="settings-view"
      aria-label={s("应用设置", "App settings")}
    >
      <h2 className="section-label">{s("偏好设置", "Preferences")}</h2>
      <div className="settings-group native-list">
        <fieldset className="language-setting">
          <legend>{s("界面语言", "Interface language")}</legend>
          <div className="language-options">
            {(
              [
                ["zh", "中文"],
                ["en", "English"],
              ] as const
            ).map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="language"
                  value={value}
                  checked={locale === value}
                  onChange={() => onLocale(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <p>{s("复习与学习辅助提示词的解释语言会跟随界面语言，英语练习内容保持英文。", "Review and learning helper explanations follow your interface language; English practice content stays in English.")}</p>
        </fieldset>
      </div>
      <h2 className="section-label">
        {s("使用 TalkSprout", "Using TalkSprout")}
      </h2>
      <div className="settings-group native-list">
        <button
          id="install"
          className="settings-row"
          onClick={(event) => {
            event.currentTarget.focus({ preventScroll: true });
            onInstall();
          }}
        >
          <span className="entry-icon">
            <Icon name="download" />
          </span>
          <span className="row-text">
            <strong>
              {installed
                ? s("已添加到主屏幕", "Added to Home Screen")
                : s("安装到手机", "Install app")}
            </strong>
            <small>
              {s(
                "像 App 一样，随时打开",
                "Open it like an app, whenever you need",
              )}
            </small>
          </span>
          <Icon name="chevron" />
        </button>
        <button
          id="about"
          className="settings-row"
          onClick={(event) => {
            event.currentTarget.focus({ preventScroll: true });
            onAbout();
          }}
        >
          <span className="entry-icon">
            <Icon name="help" />
          </span>
          <span className="row-text">
            <strong>{s("使用说明", "Instructions")}</strong>
            <small>
              {s(
                "开场练习、语音提示与结束复习",
                "Starting practice, spoken prompts, and reviews",
              )}
            </small>
          </span>
          <Icon name="chevron" />
        </button>
      </div>
      <h2 className="section-label">{s("本机与离线", "On this device")}</h2>
      <div className="settings-group settings-notes">
        <div>
          <strong>
            {online
              ? s("当前在线", "Currently online")
              : s("当前离线", "Currently offline")}
          </strong>
          <p>
            {offlineStatus === "ready"
              ? s("离线内容已就绪，提示词可离线浏览和复制。外部 AI 仍需网络。", "Offline content is ready. Browse and copy prompts offline; your external AI still needs a connection.")
              : offlineStatus === "installing"
                ? s("正在准备离线内容，请保持页面打开并联网。", "Preparing offline content. Keep this page open and connected.")
                : offlineStatus === "unavailable"
                  ? s("此浏览器当前无法保存离线内容，请联网使用。", "This browser cannot currently save offline content. Use the app online.")
                  : s("尚未确认离线内容已就绪，请联网打开并等待准备完成。", "Offline readiness is not confirmed yet. Open the app online and allow preparation to finish.")}
          </p>
        </div>
        <div>
          <strong>
            {s("收藏只保存在本机", "Favorites stay on this device")}
          </strong>
          <p>
            {s(
              "无需账号，无分析追踪。本站不接收或保存 AI 聊天；清除浏览器数据会移除收藏和偏好。",
              "No account or analytics. This app does not receive or save AI chats. Clearing browser data removes favorites and preferences.",
            )}
          </p>
        </div>
      </div>
      <p className="settings-signature">TalkSprout · OctopusGarage</p>
    </section>
  );
}
