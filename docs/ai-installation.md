# Use TalkSprout in your AI

Set up a supported Skill or plugin, or connect MCP, to choose and run TalkSprout practice directly in your AI. The web app is optional after setup. Instructions are maintained in English; the assistant explains in your preferred language. For the complete sequence, read [From first practice to saved study notes](../content/en/guides/complete-workflow.md).

## Choose a Skill edition

Open Settings → Use TalkSprout directly in your AI. Follow the supported installation instructions or download a package for your host's importer.

| Edition | File | Requirements and updates |
| --- | --- | --- |
| Lightweight | `talksprout-skill.zip` | Reads current public instructions through an available URL reader or connected TalkSprout MCP. Content updates do not require reinstalling this bootstrap. |
| Full | `talksprout-skill-full.zip` or `talksprout-full.md` | Contains the library in one file; no link reading or MCP is needed during use. Replace the snapshot for content updates. |

Choose one edition; both use the Skill name `talksprout`. ZIP packages contain `talksprout/SKILL.md`. The standalone Markdown has identical full-edition instructions for direct file attachment. Host upload size and context limits still apply; accepting a file does not prove that the model retained every instruction.

The repository Skill is `skills/talksprout`. Compatible installers can use `npx skills add OctopusGarage/talksprout --skill talksprout`. Import/installation availability depends on your host and account controls.

For a browser assistant without a URL reader, attach the full Markdown file to a normal chat or use its supported Skill importer, then ask “Use TalkSprout; help me choose first.” This does not require a dedicated bot or Gem. No Gemini account installation or end-to-end browser compatibility is claimed here.

## Plugins and MCP

- **ChatGPT plugin:** `talksprout-plugin-chatgpt.zip`, with root `plugin.json` and `skills/talksprout/`. Use an eligible workspace's supported plugin flow. Public directory approval and universal upload availability are not claimed.
- **Claude plugin:** `talksprout-plugin-claude.zip`, with `.claude-plugin/plugin.json` and `skills/talksprout/`. This is a plugin archive, not a Claude.ai Skill ZIP; use a standalone Skill for a Skill importer.
- **MCP:** connect `https://talksprout-mcp.octopusgarage.workers.dev/mcp` using Streamable HTTP without authentication. See [MCP setup](mcp-server.md) for configuration and self-hosting.

Plugins use the lightweight Skill. Installing them does not connect MCP, grant permissions or add network/audio/storage tools. MCP supplies public learning documents and remains read-only.

## Start and continue

Ask “Use TalkSprout; help me choose a practice mode and topic first.” Reply to the relevant choices with a number or natural language. Supplied goals and settings are reused; a specific request can start directly.

On hosts with Skill invocation, `$talksprout` offers the next choices for the visible conversation: initial practice options, active-session controls, review types after finishing, or next steps after a completed review. It does not automatically reset the lesson.

Examples:

- “Use TalkSprout Friendly Free Chat. Share your thoughts too; don't ask a question every turn.”
- “Run a TalkSprout mock technical interview and save feedback until the end.”
- “Finish practice. Create TalkSprout Study Notes from this conversation.”

Friendly Free Chat and Exchange Views support reciprocal discussion and brief correction without mandatory retries. Guided coaches retain their own correction rules. Listening and reading tasks need actual accessible source material; review uses the current conversation or a supplied speaker-labeled transcript.

## Voice, review and saving

Use your AI platform's own voice control after supplying the practice instructions. Skill, plugin and MCP installation do not activate a microphone. Check whether voice shares the text conversation's context. Text or transcripts alone cannot establish pronunciation.

Choose one review artifact after practice. Generate written material before copying or exporting it. The shared [archiving guide](../content/en/notes.md) recommends a TalkSprout container and date/topic/type titles, while honoring existing preferences and distinguishing updates from separate sessions. Copy the detailed convention from “Save your notes” on AI setup.

Saving needs an explicit request and an available authorized host tool. Without one, copy or download the material and save it yourself. Check the actual title, destination and link; generation does not imply a completed cloud save or automatic NotebookLM synchronization.

## Troubleshooting and privacy

- If installation is unsupported, use an available importer, attach the full instructions, or copy an app prompt.
- If remote reading fails, try the matching rendered GitHub entry, use the full edition, or supply the selected document. Search snippets alone are not a loaded document.
- If a document cannot be found, reload the current session entry and follow its catalog. `references/release.md` identifies the installed artifact, not the current remote content version.
- Check downloaded artifacts against adjacent `SHA256SUMS`. Downloads require connectivity and are not part of the promised offline app cache.

The integrations read public learning content, not browser favorites, private scenario background or other conversations. Material you send to an external assistant follows that platform's data handling.
