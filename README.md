# TalkSprout

[![Check and deploy](https://github.com/OctopusGarage/talksprout/actions/workflows/pages.yml/badge.svg)](https://github.com/OctopusGarage/talksprout/actions/workflows/pages.yml)
[![Release](https://img.shields.io/github/v/release/OctopusGarage/talksprout)](https://github.com/OctopusGarage/talksprout/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Practise English with AI conversation coaches, realistic scenarios and useful study notes.

[Open the app](https://octopusgarage.github.io/talksprout/) · [Complete workflow](content/en/guides/complete-workflow.md) · [Use in your AI](docs/ai-installation.md) · [Documentation](docs/README.md)

## Start practising

Choose either route:

1. **Copy a prompt:** choose a practice in the app, select an optional compatible scenario, copy the full prompt and send it to your AI. At the end, send a review prompt into the same conversation.
2. **Use TalkSprout inside your AI:** install a supported Skill or plugin, or connect MCP. Ask “Use TalkSprout; help me choose first.” A bare `$talksprout` invocation on supported hosts offers choices based on the current conversation. The web app is optional after setup.

AI instructions are maintained in English; the assistant uses your preferred explanation language. The lightweight Skill retrieves current remote instructions. The full Skill contains the library in one file for hosts without link reading; replace that snapshot to update its content. Choose one edition. Voice and cloud saving use your AI platform's own capabilities.

Read [From first practice to saved study notes](content/en/guides/complete-workflow.md) for selection, voice, review, saving and returning to practice. The article is also first in the app's Learning Guides and linked from AI setup.

## What you can practise

| Area | Options |
| --- | --- |
| Conversation | Natural Conversation, Gentle Conversation, Focused Correction, Score and Rewrite, Friendly Free Chat, Exchange Views |
| Interactive practice | Role-play, Debate, Vocabulary Game |
| Practice with material | Visual Description, Live Camera, Retelling |
| Listening, reading and writing | 18 focused helpers, including dictation comparison, comprehension, technical documents, email and revision |
| Review | Study notes, sentence corrections, vocabulary and pronunciation notes, self-test cards |

Friendly Free Chat and Exchange Views support reciprocal discussion, substantive AI contributions and optional questions. Other coaches offer their own correction and retry rhythms. Select a mode that fits your purpose.

Scenario-capable coaches offer 160 presets across everyday life, travel, services, workplace communication and technical interviews. Compatible interviews support coached practice or mock interviews with feedback at the end. Private background stays out of saved combinations and share links.

Learning Guides contains eleven companion guides and seven further readings, including learning methods, voice practice, dedicated AI chats and global instructions. Written review artifacts can follow a shared [naming and archiving convention](content/en/notes.md): a TalkSprout container and `YYYY-MM-DD - Topic - Material Type` titles. Generating a note does not save it; saving requires an explicit request and an authorized host tool, or manual copying/export.

## App features

- Chinese and English interfaces, bilingual search and language-aware review explanations. English learning instructions and examples stay in English.
- Favorites, saved practice combinations and recent copies stored on this device. Share a practice link or an app invitation with a QR code.
- Installable PWA with cached content available offline after a successful complete online visit. External AI access still needs connectivity.
- Mobile navigation, keyboard-accessible dialogs, exact prompt copying and selectable-text fallback.

Open Settings → Install app for device instructions. Updates wait for **Update now**. If the app cannot load, use [Reopen TalkSprout](https://octopusgarage.github.io/talksprout/recover.html) to clear this deployment's service worker and caches while preserving local preferences.

TalkSprout has no account or analytics and does not store AI conversations. Clearing browser data removes local preferences. It supplies learning instructions; it does not host an AI chat or provide microphone, camera or cloud-storage access. Host availability and permissions determine those features.

## Development

Use Node.js 22.12+ and pnpm 10. CI uses Node.js 24.

```sh
pnpm install --frozen-lockfile
pnpm --dir mcp install --frozen-lockfile
pnpm sync
pnpm dev
```

Release checks:

```sh
pnpm test
pnpm build
pnpm exec playwright install chromium webkit
pnpm test:e2e
pnpm test:webkit
```

CI checks generated output, formatting, documentation links, MCP types/protocol, unit tests, builds and Chromium. WebKit is a local release check. These checks do not certify third-party account installation, audio behavior or learning outcomes.

## Deployment and integrations

The main workflow deploys tested artifacts to GitHub Pages and Cloudflare, verifies the MCP identity and protocol, then publishes immutable versioned packages. Maintainers should follow [distribution maintenance](docs/distribution-maintenance.md).

The public read-only MCP endpoint is `https://talksprout-mcp.octopusgarage.workers.dev/mcp` (Streamable HTTP, no authentication). It serves the English learning library generated from the app’s canonical content; it does not write notes or access private app data. See [MCP setup](docs/mcp-server.md).

[Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [MIT license](LICENSE)
