# Use TalkSprout in your AI

Install a Skill or plugin, or connect MCP, to practise directly in your AI. The web app is optional. The lightweight edition retrieves public learning instructions; the full edition contains them in a single SKILL.md and needs no link reader or MCP during use.

Open Settings → Use TalkSprout directly in your AI. Copy the installation instructions into an assistant with a supported Skill installer, or download the standalone ZIP for your host's Skill importer. The repository skill is `skills/talksprout`; compatible installers can use `npx skills add OctopusGarage/talksprout --skill talksprout`.

## Choose a channel

- Lightweight Skill: `talksprout-skill.zip`, containing `talksprout/SKILL.md`, metadata, icon, license and release identity.
- Full Skill: `talksprout-skill-full.zip`, with all learning content inside `talksprout/SKILL.md`. The identical `talksprout-full.md` is available for a direct file upload. Choose one edition; both use the name `talksprout`.
- ChatGPT plugin: `talksprout-plugin-chatgpt.zip`, with root `plugin.json` and `skills/talksprout/`. Use only an eligible workspace's supported plugin import flow. A public directory submission is a separate operation; this repository does not claim approval or universal upload availability.
- Claude plugin: `talksprout-plugin-claude.zip`, with `.claude-plugin/plugin.json` and `skills/talksprout/`. Use a supported Claude plugin installation/import flow. A plugin archive is not a Claude.ai Skill ZIP; use the standalone Skill for Skill import where available.
- MCP: connect `https://talksprout-mcp.octopusgarage.workers.dev/mcp` using Streamable HTTP with no authentication. See [MCP configuration](mcp-server.md) for client setup and optional self-hosting.

The lightweight Skill and plugins use public Markdown or already connected MCP tools. Installing a package does not connect MCP, grant network access or enable audio. No consumer Python runtime, TalkSprout app, account or API key is required. Host permissions and plan/workspace availability still apply.

## Remote updates

The installed lightweight Skill is a small bootstrap. At each new session it reads the current remote entry, which supplies selection rules and learning catalogs. Lightweight Skill and plugin archives follow the latest remote documents, not the archive revision. Normal content and guidance updates require no client reinstall; changes to the bootstrap protocol or host permissions may require one. Existing revision-pinned packages must be updated once to this bootstrap. Connected MCP reads its deployed feed and keeps the same endpoint across updates.

The full edition is a versioned content snapshot generated from the same app sources. All coaches, reviews, listening/reading/writing instructions, scenario data, scenario composition templates and complete bilingual method articles are embedded in SKILL.md. Templates share common rules rather than duplicating every scenario/coach combination; tests reconstruct every full and spoken app scenario exactly. Update the full edition by replacing its file/package. It does not refresh remotely.

## Contextual invocation

Invoke `$talksprout` without arguments to choose the next action from the visible conversation. A new conversation offers practice and learning goals; active practice offers continue, help, adjust or finish; explicitly finished practice offers the four review formats; completed reviews offer follow-up practice, self-tests or a new task. Ambiguous context prompts one clarification. Menus and setup replies are never treated as learner practice. Explicit task requests bypass general menus. The stable `start.md` URL serves a session and navigation guide, not an instruction to restart.

## First use

Say “用 TalkSprout 开始练习，先引导我选择内容。” or “Start practising with TalkSprout. Help me choose first.” The assistant guides you through the goal, relevant coach/task and any needed scene, interview pace, review source or material before starting. Reply with a number or natural language; ask for a recommendation or go back. Choices already supplied are reused. Selection replies are not learner practice or review material. Specific requests skip resolved steps.

Ask “Use TalkSprout to practice a workplace conversation” or “用 TalkSprout 练习英文面试”. Choose a coach and compatible scenario. Ask for help, review or finish as appropriate. For a review, use the same chat or provide a speaker-labeled transcript. Listening and reading tasks require accessible source material; captions alone do not establish pronunciation.

## Troubleshooting

If installation is unavailable, use the supported manual importer or copy a prompt from the web app. If the host cannot read raw GitHub, the Skill tries the matching entry's rendered GitHub page once; otherwise supply the selected document yourself. If MCP is missing, connect it separately or use URL reading. If a document is missing, reload the remote entry and use its current catalog links. `references/release.md` identifies the installed bootstrap artifact, not the live document version. Verify downloaded archives with the adjacent `SHA256SUMS`. Downloads require connectivity and are not promised as part of the app's offline cache.

The integrations read public learning content. They do not read favorites, local storage, private scenario background or other conversations. Material sent to an external assistant is governed by that assistant's handling of data.

## Browser-only assistants

For a session without a URL reader, use the full edition instead of the lightweight bootstrap. In Gemini web, upload the full SKILL.md through the available Skills importer, or attach the complete Markdown file to a normal chat and ask “Use TalkSprout; help me choose first.” A Gem is not required. Google documents [Skill file uploads](https://support.google.com/gemini/answer/17094296) and [chat attachments](https://support.google.com/gemini/answer/14903178). Host context limits still apply: the full edition is approximately 400 KB and must be read in full; upload size alone does not establish that the model retained every instruction. Gemini account installation and end-to-end behavior remain untested here.

Uploading a lightweight Skill does not add network tools or connect MCP. The bootstrap tries the host’s available link-opening, browser or full-page reading capabilities without relying on a particular tool name. Search snippets do not establish that the learning document was loaded. If none works, it supplies a clickable entry link and offers attaching the entry and selected learning document in the same chat. Creating a Gem is not required. Ordinary conversation without the retrieved content is a separate option, not verified TalkSprout practice. Gemini web compatibility has not been account-tested; capability availability depends on the actual session.
