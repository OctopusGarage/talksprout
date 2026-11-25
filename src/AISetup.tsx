import { useLayoutEffect, useRef, useState } from "react";
import type { ClipboardWriter } from "./clipboard-writer";
import type { Locale } from "./types";
import config from "../distribution/config.json";
export function AISetup({
  locale,
  writer,
  copying,
}: {
  locale: Locale;
  writer: ClipboardWriter;
  copying: boolean;
}) {
  const en = locale === "en";
  const endpoint: string | null = config.mcpEndpoint;
  const [status, setStatus] = useState("");
  const [manual, setManual] = useState(false);
  const text = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(
    () => () => {
      writer.invalidate();
    },
    [writer],
  );
  useLayoutEffect(() => {
    if (manual) {
      text.current?.focus();
      text.current?.select();
    }
  }, [manual]);
  const instruction = `Install the TalkSprout skill from ${config.repository}/tree/main/skills/talksprout using your supported skill installer. Read its SKILL.md before use. If installation is unavailable, explain the supported manual option. Installing the skill does not connect MCP. Then help me choose an English practice coach. Explain in ${en ? "English" : "Chinese"}.`;
  function copy() {
    if (copying) return;
    setStatus("");
    void writer.write({
      text: instruction,
      onSuccess: () => setStatus(en ? "Copied" : "已复制"),
      onFailure: () => {
        setManual(true);
        setStatus(
          en
            ? "Select and copy the instructions below."
            : "请选中并复制下方指令。",
        );
        // A second failed attempt must also restore the selection.
        if (manual) {
          text.current?.focus();
          text.current?.select();
        }
      },
    });
  }
  return (
    <section
      id="ai-setup"
      className="settings-group settings-notes"
      aria-labelledby="ai-setup-title"
    >
      <h2 id="ai-setup-title">
        {en ? "Use TalkSprout in your AI" : "在你的 AI 中使用 TalkSprout"}
      </h2>
      <p>
        {en
          ? "Install the Skill to choose coaches, practice scenarios and review accessible conversations in your own assistant."
          : "安装 Skill，在你自己的 AI 助手里选择教练、练习场景并复习可访问的对话。"}
      </p>
      <button type="button" disabled={copying} onClick={copy}>
        {en ? "Copy installation instructions" : "复制安装指令"}
      </button>
      <p role="status">{status}</p>
      <details open={manual || undefined}>
        <summary>
          {en ? "Manual installation and downloads" : "手动安装与下载"}
        </summary>
        <textarea
          ref={text}
          readOnly
          aria-label={en ? "Installation instructions" : "安装指令"}
          value={instruction}
          rows={7}
          onFocus={(event) => event.currentTarget.select()}
        />
        <p>
          {en
            ? "Use your host’s supported Skill or plugin import flow. Formats and account permissions differ; upload, installation and public directory publication are separate steps."
            : "请使用所在平台支持的 Skill 或插件导入流程。格式和账号权限各异；上传、安装和公开上架是不同操作。"}
        </p>
        <ul>
          {Object.entries(config.packages).map(([kind, name]) => (
            <li key={kind}>
              <a href={`${import.meta.env.BASE_URL}downloads/${name}`} download>
                {kind === "skill"
                  ? "Skill"
                  : kind === "plugin"
                    ? "ChatGPT plugin"
                    : "Claude plugin"}{" "}
                ZIP
              </a>
            </li>
          ))}
        </ul>
        <a href={`${import.meta.env.BASE_URL}downloads/SHA256SUMS`}>
          {en ? "Package checksums" : "安装包校验值"}
        </a>
      </details>
      <details>
        <summary>MCP</summary>
        {endpoint ? (
          <p>
            <a href={endpoint}>{endpoint}</a> · Streamable HTTP ·{" "}
            {en ? "Authentication: none" : "无需认证"}
          </p>
        ) : null}
        <p>
          {endpoint
            ? en
              ? "Connect this endpoint separately through your host’s MCP settings."
              : "请在 AI 平台的 MCP 设置中单独连接此地址。"
            : en
              ? "The read-only MCP server is included for self-hosting. No public endpoint has been verified yet. Skill and plugin installation do not connect it automatically."
              : "仓库提供可自行部署的只读 MCP 服务，目前尚未验证公开服务地址。安装 Skill 或插件不会自动连接 MCP。"}
        </p>
        <a href={`${config.repository}/blob/main/docs/mcp-server.md`}>
          {en ? "MCP configuration" : "MCP 配置指南"}
        </a>
      </details>
      <p>
        {en
          ? "Requires public URL reading or an already connected MCP. No TalkSprout API key or app login is needed. Your host controls network and audio access. Private favorites and scenario background are not shared."
          : "需要公开链接读取能力或已连接的 MCP。无需 TalkSprout API key 或应用登录。联网和音频能力由 AI 平台提供；不会共享本机收藏或私人场景背景。"}
      </p>
      <a href={`${config.repository}/blob/main/docs/ai-installation.md`}>
        {en ? "Installation guide and troubleshooting" : "安装指南与故障排查"}
      </a>
    </section>
  );
}
