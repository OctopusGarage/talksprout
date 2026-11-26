import { useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { ClipboardWriter } from "./clipboard-writer";
import type { Locale } from "./types";
import { AiCopy } from "./AiCopy";
import {
  buildStudyNoteArchiveGuide,
  studyNoteArchiveExample,
} from "./content/study-note-archive";
import {
  aiDescription,
  aiExamples,
  aiLinks,
  mcpSetupPrompt,
  skillInstallPrompt,
} from "./ai-onboarding";
import { Icon } from "./Icon";
import aiIcon from "../public/icons/icon-192.png";
import config from "../distribution/config.json";
import "./ai-guide.css";

type Method = "skill" | "plugin" | "mcp";
const data = config;
const links = aiLinks(data);
const download = (name: string) =>
  import.meta.env.BASE_URL + "downloads/" + name;

export function AISetup({
  locale,
  writer,
  copying,
  online,
}: {
  locale: Locale;
  writer: ClipboardWriter;
  copying: boolean;
  online: boolean;
}) {
  const s = (zh: string, en: string) => (locale === "zh" ? zh : en);
  const id = useId();
  const [method, setMethod] = useState<Method>("skill");
  const [host, setHost] = useState("chatgpt");
  const [edition, setEdition] = useState<"light" | "full">("light");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useLayoutEffect(() => {
    writer.invalidate();
  }, [method, host, edition, locale, writer]);
  const choices: { id: Method; label: string }[] = [
    { id: "skill", label: s("安装 Skill", "Install Skill") },
    { id: "plugin", label: s("上传插件", "Upload plugin") },
    { id: "mcp", label: s("连接 MCP", "Connect MCP") },
  ];
  function tabKey(event: KeyboardEvent, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? 2
          : (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
    setMethod(choices[next].id);
    tabs.current[next]?.focus();
  }
  const copy = (
    text: string,
    label: string,
    primary = false,
    compact = false,
  ) => (
    <AiCopy
      text={text}
      label={label}
      primary={primary}
      compact={compact}
      locale={locale}
      writer={writer}
      busy={copying}
    />
  );
  const prompt =
    method === "skill"
      ? skillInstallPrompt(data, locale)
      : mcpSetupPrompt(data, locale);
  const pluginName =
    host === "claude" ? data.packages.claudePlugin : data.packages.plugin;
  return (
    <section id="ai-setup" className="ai-guide">
      <header className="ai-intro">
        <img src={aiIcon} width="48" height="48" alt="" />
        <div>
          <h2>{s("在 AI 中练英语", "English practice in your AI")}</h2>
          <p>
            {s(
              "接入后，在 AI 中直接练习，无需打开网页。",
              "Set up once to practise directly in your AI.",
            )}
          </p>
        </div>
      </header>
      <a className="ai-doc-link" href="#guides/complete-workflow">
        {s(
          "完整使用流程：从练习到保存笔记",
          "Full workflow: from practice to saved notes",
        )}
      </a>
      <div
        className="ai-methods"
        role="tablist"
        aria-label={s("接入方式", "Setup method")}
      >
        {choices.map((choice, index) => (
          <button
            type="button"
            key={choice.id}
            ref={(el) => {
              tabs.current[index] = el;
            }}
            id={`${id}-${choice.id}`}
            role="tab"
            aria-selected={method === choice.id}
            aria-controls={`${id}-panel`}
            tabIndex={method === choice.id ? 0 : -1}
            onKeyDown={(event) => tabKey(event, index)}
            onClick={() => setMethod(choice.id)}
          >
            {choice.label}
          </button>
        ))}
      </div>
      {!online && (
        <p className="ai-offline" role="status">
          {s(
            "当前离线，下载和连接 AI 需要联网。",
            "You are offline. Downloads and AI connections need a network.",
          )}
        </p>
      )}
      <section
        className="ai-setup"
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-${method}`}
      >
        {method === "skill" && (
          <>
            <h3>{s("安装 Skill", "Install the Skill")}</h3>
            <fieldset className="ai-host">
              <legend>{s("版本", "Edition")}</legend>
              <div className="ai-host-options">
                {(["light", "full"] as const).map((value) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name={`${id}-edition`}
                      value={value}
                      checked={edition === value}
                      onChange={() => setEdition(value)}
                    />
                    <span>
                      {value === "light"
                        ? s("轻量版", "Lightweight")
                        : s("完整版", "Full edition")}
                      <Icon name="check" />
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="ai-description">
              {edition === "light"
                ? s(
                    "需支持 Skill，并能读取网页或使用已连接的 MCP。",
                    "Requires Skill support and web reading or an already connected MCP.",
                  )
                : s(
                    "全部学习内容内置，无需读取链接或连接 MCP。更新内容需重新下载。",
                    "All learning content is included. No link reader or MCP required. Download again to update content.",
                  )}
            </p>
            {edition === "light" ? (
              <div className="ai-actions">
                {copy(
                  prompt,
                  s("复制安装指令", "Copy installation instructions"),
                  true,
                )}
                <a
                  className="ai-secondary"
                  href={download(data.packages.skill)}
                  download={data.packages.skill}
                >
                  {s("下载 Skill 包", "Download Skill package")}
                </a>
              </div>
            ) : (
              <>
                <p className="ai-note">
                  {s(
                    "支持 Skill 时上传安装包；Gemini 等普通对话可上传完整指令文件，再说「用 TalkSprout 开始练习」。两个版本选一个即可。",
                    "Upload the package to a supported Skills importer, or attach the complete instructions to a chat such as Gemini and say “Use TalkSprout.” Choose one edition.",
                  )}
                </p>
                <div className="ai-actions">
                  <a
                    className="ai-primary"
                    href={download(data.packages.fullSkill)}
                    download={data.packages.fullSkill}
                  >
                    <Icon name="download" />
                    {s("下载完整版 Skill", "Download full Skill")}
                  </a>
                  <a
                    className="ai-secondary"
                    href={download(data.packages.fullSkillText)}
                    download="SKILL.md"
                  >
                    {s("下载完整指令文件", "Download complete instructions")}
                  </a>
                </div>
              </>
            )}
          </>
        )}
        {method === "plugin" && (
          <>
            <h3>{s("上传到你的 AI", "Upload to your AI")}</h3>
            <fieldset className="ai-host">
              <legend>{s("使用的 AI", "Your AI")}</legend>
              <div className="ai-host-options">
                {(["chatgpt", "claude"] as const).map((value) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name={`${id}-host`}
                      value={value}
                      checked={host === value}
                      onChange={() => setHost(value)}
                    />
                    <span>
                      {value === "chatgpt" ? "ChatGPT" : "Claude"}
                      <Icon name="check" />
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <ol className="ai-instructions">
              <li>
                {s(
                  "下载对应的插件包。",
                  "Download the plugin package for your AI.",
                )}
              </li>
              <li>
                {host === "claude"
                  ? s(
                      "在支持插件导入的 Claude 环境中上传并启用；只有 Skills 入口时请改用 Skill 包。",
                      "Import and enable it in a Claude environment supporting plugins. For a Skills importer, use the Skill package instead.",
                    )
                  : s(
                      "在支持插件上传的 ChatGPT 工作区导入并启用。是否可用取决于账号和工作区权限。",
                      "Import it in an eligible ChatGPT workspace with plugin uploads. Availability depends on account and workspace permissions.",
                    )}
              </li>
            </ol>
            <div className="ai-actions">
              <a
                className="ai-primary"
                href={download(pluginName)}
                download={pluginName}
              >
                <Icon name="download" />
                {s("下载插件包", "Download plugin package")}
              </a>
              <a
                className="ai-secondary"
                href={
                  host === "claude"
                    ? "https://claude.ai/"
                    : "https://admin.openai.com/"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {host === "claude"
                  ? s("打开 Claude", "Open Claude")
                  : s("打开 ChatGPT 管理后台", "Open ChatGPT admin console")}
                <span aria-hidden="true"> ↗</span>
              </a>
            </div>
          </>
        )}
        {method === "mcp" && (
          <>
            <h3>{s("连接学习库", "Connect the learning library")}</h3>
            <p className="ai-description">
              {s(
                "复制配置指令，或手动填写下方地址。",
                "Copy the setup instructions, or enter this URL manually.",
              )}
            </p>
            <code className="ai-endpoint" dir="ltr">
              {data.mcpEndpoint}
            </code>
            <p className="ai-note">
              {s(
                "名称 TalkSprout · Streamable HTTP · 无需认证",
                "Name: TalkSprout · Streamable HTTP · No authentication",
              )}
            </p>
            <div className="ai-actions">
              {copy(prompt, s("复制配置指令", "Copy setup instructions"), true)}
              {copy(data.mcpEndpoint, s("复制 MCP 地址", "Copy MCP URL"))}
            </div>
            <details>
              <summary>{s("描述与图标", "Description and icon")}</summary>
              <p>{aiDescription[locale]}</p>
              <div className="ai-actions">
                {copy(aiDescription[locale], s("复制描述", "Copy description"))}
                <a
                  className="ai-secondary"
                  href={import.meta.env.BASE_URL + "icons/icon-512.png"}
                  download="talksprout-icon.png"
                >
                  {s("下载图标", "Download icon")}
                </a>
              </div>
            </details>
          </>
        )}
        {(method === "mcp" || (method === "skill" && edition === "light")) && (
          <details className="ai-prompt">
            <summary>{s("查看接入指令", "View setup instructions")}</summary>
            <pre className="ai-command">{prompt}</pre>
          </details>
        )}
      </section>
      <section className="ai-examples" aria-labelledby={`${id}-examples`}>
        <h3 id={`${id}-examples`}>
          {s("试着这样开始", "Try a first request")}
        </h3>
        <ul>
          {aiExamples[locale].map((example) => (
            <li key={example}>{copy(example, example, false, true)}</li>
          ))}
        </ul>
      </section>
      <details className="ai-archive">
        <summary>
          <span>{s("保存笔记", "Save your notes")}</span>
          <Icon name="chevron" />
        </summary>
        <div className="ai-archive-body">
          <div className="ai-archive-example">
            <p>
              {s(
                "统一放在 TalkSprout，按日期命名。",
                "Keep notes in TalkSprout, with the date first.",
              )}
            </p>
            <code>{studyNoteArchiveExample[locale]}</code>
          </div>
          {copy(
            buildStudyNoteArchiveGuide(),
            s("复制规则", "Copy naming rules"),
          )}
        </div>
      </details>
      <footer className="ai-footer">
        <p>
          {s(
            "公开英语学习内容 · 不读取本机收藏或私人背景",
            "Public English learning content · no private app data",
          )}
        </p>
        <a
          href={`${data.repository}/blob/main/docs/ai-installation.md`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {s("安装帮助", "Setup help")}
          <span aria-hidden="true"> ↗</span>
        </a>
        <a href={links.release} target="_blank" rel="noopener noreferrer">
          {s(
            `全部安装包 · v${data.version}`,
            `All packages · v${data.version}`,
          )}
          <span aria-hidden="true"> ↗</span>
        </a>
      </footer>
    </section>
  );
}
