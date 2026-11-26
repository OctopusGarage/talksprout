export function buildSkillBootstrap(): string {
  return `---
name: talksprout
description: English practice, conversation review and learning methods with TalkSprout. Use for explicit TalkSprout requests or a bare invocation to choose the next action from the current conversation.
---
# TalkSprout

Load the current session guide when it is not already available in context. It provides intent routing, context-sensitive choices and links to the learning catalogs; loading it does not start or reset a lesson.

- English: https://raw.githubusercontent.com/OctopusGarage/talksprout/main/content/en/start.md
- Chinese: https://raw.githubusercontent.com/OctopusGarage/talksprout/main/content/zh/start.md

If TalkSprout MCP is connected, use get_guide and read_document. Otherwise use an available link-opening, browsing, fetch or full-page reading tool. Search snippets alone are not a loaded document. If raw GitHub is unavailable, use the matching rendered page:
- English: https://github.com/OctopusGarage/talksprout/blob/main/content/en/start.md
- Chinese: https://github.com/OctopusGarage/talksprout/blob/main/content/zh/start.md

Follow the guide for the learner’s intent, read only the selected material and retain active session state. A bare invocation requests contextual options; an explicit task takes precedence. Stable remote URLs provide updates independently of the installed package.

If retrieval is unavailable, state that the content has not loaded, provide the complete entry link, and offer document upload or a supported MCP connection. Keep ordinary English practice separate and opt-in. Respect host permissions; use existing tools without installing runtimes or shell-based network retrieval. Installation grants no additional capabilities.
`;
}
