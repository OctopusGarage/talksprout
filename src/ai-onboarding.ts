import type { Locale } from "./types";
interface AiDistribution {
  version: string;
  repository: string;
  mcpEndpoint: string;
  packages: { skill: string; plugin: string; claudePlugin: string };
}
export function aiLinks(data: AiDistribution) {
  return {
    release: `${data.repository}/releases/tag/v${data.version}`,
    source: `${data.repository}/tree/main/skills/talksprout`,
  };
}
export function skillInstallPrompt(data: AiDistribution, locale: Locale) {
  return locale === "zh"
    ? `请安装或更新 TalkSprout Skill：${aiLinks(data).source}`
    : `Install or update the TalkSprout Skill: ${aiLinks(data).source}`;
}
export function mcpSetupPrompt(data: AiDistribution, locale: Locale) {
  return locale === "zh"
    ? `请添加 TalkSprout MCP：${data.mcpEndpoint}\n传输方式：Streamable HTTP；无需认证。`
    : `Add TalkSprout MCP: ${data.mcpEndpoint}\nTransport: Streamable HTTP. No authentication.`;
}
export const aiDescription = {
  zh: "TalkSprout：英语对话教练、角色扮演、面试练习、复习和听读写辅助。",
  en: "TalkSprout: English conversation coaches, role-play, interview practice, reviews and listening, reading and writing guidance.",
};
export const aiExamples = {
  zh: [
    "$talksprout",
    "用 TalkSprout 陪我练习一次英文工作沟通，一次只问一个问题。",
    "用 TalkSprout 做一场英文技术模拟面试，结束后再反馈。",
    "用 TalkSprout 整理这段对话的真实纠错和复习卡片。",
  ],
  en: [
    "$talksprout",
    "Use TalkSprout to practise a workplace conversation, one question at a time.",
    "Run a TalkSprout mock technical interview and save feedback until the end.",
    "Use TalkSprout to review this conversation with genuine corrections and recall cards.",
  ],
};
