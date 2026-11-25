# Use TalkSprout in your AI

Open Settings → Use TalkSprout in your AI. Copy the installation instructions into an assistant with a supported Skill installer. Review what your host proposes before installing. The repository skill is `skills/talksprout`; compatible installers can use `npx skills add OctopusGarage/talksprout --skill talksprout`. An installer is optional: download the standalone ZIP and follow your host's Skill import instructions. Do not paste ZIP bytes into a conversation.

## Choose a channel

- Skill: `talksprout-skill.zip`, containing `talksprout/SKILL.md`, metadata, icon, license and release identity.
- ChatGPT plugin: `talksprout-plugin-chatgpt.zip`, with root `plugin.json` and `skills/talksprout/`. Use only an eligible workspace's supported plugin import flow. A public directory submission is a separate operation; this repository does not claim approval or universal upload availability.
- Claude plugin: `talksprout-plugin-claude.zip`, with `.claude-plugin/plugin.json` and `skills/talksprout/`. Use a supported Claude plugin installation/import flow. A plugin archive is not a Claude.ai Skill ZIP; use the standalone Skill for Skill import where available.
- MCP: connect a self-hosted Streamable HTTP endpoint. See [MCP configuration](mcp-server.md). The verified public endpoint is `https://talksprout-mcp.octopusgarage.workers.dev/mcp` (Streamable HTTP, no authentication).

The Skill and plugins use public Markdown or already connected MCP tools. Installing a package does not connect MCP, grant network access or enable audio. No consumer Python runtime, TalkSprout app, account or API key is required. Host permissions and plan/workspace availability still apply.

## First use

Ask “Use TalkSprout to practice a workplace conversation” or “用 TalkSprout 练习英文面试”. Choose a coach and compatible scenario. Ask for help, review or finish as appropriate. For a review, use the same chat or provide a speaker-labeled transcript. Listening and reading tasks require accessible source material; captions alone do not establish pronunciation.

## Troubleshooting

If installation is unavailable, use the supported manual importer or copy a prompt from the web app. If the host cannot read raw GitHub, the Skill tries the same revision's rendered GitHub page once; otherwise supply the selected document yourself. If MCP is missing, connect it separately or use URL reading. A missing document usually indicates mixed releases: keep all content on the revision recorded in `references/release.md`. Verify downloaded archives with the adjacent `SHA256SUMS`. Downloads require connectivity and are not promised as part of the app's offline cache.

The integrations read public learning content. They do not read favorites, local storage, private scenario background or other conversations. Material sent to an external assistant is governed by that assistant's handling of data.
