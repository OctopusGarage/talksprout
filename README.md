# TalkSprout

Reusable prompts for learning English with AI: choose a conversation coach, practice speaking, and turn completed chats into study material.

[Open TalkSprout](https://octopusgarage.github.io/talksprout/)

## Use the app

- **Start practice:** choose a collection and coaching style. Copy the full prompt into a new AI conversation, or read its short spoken opening aloud.
- **Wrap-up & Review:** send a review prompt at the end of that same conversation to create notes, sentence practice, vocabulary, or self-test cards.
- **Settings:** choose the interface language, find installation help, and read the instructions.

The interface supports Chinese and English. Prompt instructions are in English; review prompts request English learning examples with concise Chinese explanations. TalkSprout provides prompts for your preferred AI app; it does not run an AI chat itself.

## Conversation coaches

| Collection             | Modes                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Conversation coaches   | Natural Conversation Coach; Gentle Conversation Coach; Focused Correction Coach; Score and Rewrite Coach |
| Interactive coaching   | Role-play Coach; Debate Coach; Vocabulary Game Coach                                                     |
| Practice with material | Visual Description Coach; Retelling Coach                                                                |

Each mode defines how the AI teaches, when it corrects, and how the conversation continues. Choose topics such as travel, sports, ordering food, or interviews during the conversation rather than choosing another prompt.

Every coach has a full prompt and a short spoken opening, with sentence-by-sentence reading and an estimated reading time. Short forms preserve the core coaching loop but do not establish equal behavior across AI services.

## Wrap-up & Review

| Review                             | Purpose                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Complete Study Notes (recommended) | Cover the main topics, genuine corrections, useful sentences, vocabulary, and recall tasks.          |
| Sentences and Corrections          | Keep original wording, distinguish errors from optional improvements, and collect reusable patterns. |
| Vocabulary and Pronunciation Notes | Record contextual meanings, collocations, examples, and American IPA for selected key words.         |
| Review Cards and Self-Test         | Generate questions first and a separate answer key, without starting another quiz.                   |

Use **Current AI chat** in the original conversation. For another conversation, choose **Another transcript**, copy the template, and replace its placeholder with a speaker-labeled transcript before sending it to your AI. Do not paste your transcript into TalkSprout.

Each review also has a short **Spoken wrap-up** for the current chat. Request written material where supported; voice-only replies fall back to a brief oral recap. AI can review only the context it can access. Uncertain IPA needs verification and cannot establish how you pronounced a word.

## Navigation and local data

Phones use bottom navigation; desktop uses a sidebar. Only the content area scrolls. Prompt sheets keep the copy action visible and support browser Back, Escape, and focus restoration. A pending copy finishes before another write can start; switching formats or leaving a sheet clears its copy feedback. Existing collection links remain valid; a prompt link looks like `#collection/companions?prompt=daily-check-in`.

Search and saved filters remain separate for practice, each practice collection, and review. The practice-home search covers all coaches; collection searches stay within that collection. Filters and scroll positions last for the current session, while favorites, recent-copy IDs, and language preferences are saved on this device.

No account, API key, or analytics is required. TalkSprout does not receive or store AI conversations. Clearing browser data removes local preferences and favorites.

## Install and use offline

Open **Settings → Install app** for device-specific instructions. After a complete online visit and successful caching, prompts can be browsed and copied offline. External AI still requires a connection. Available updates wait for **Update and reload**.

If loading fails, open [Reopen TalkSprout](https://octopusgarage.github.io/talksprout/recover.html) and select **Reopen app**. Recovery clears only TalkSprout's service worker and caches, preserving favorites and language preferences.

## Development

Use Node.js 22.12+ and pnpm 10. CI uses Node.js 24.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Run the release checks (including archive-integrity, clipboard-ordering, and worker-update regressions):

```sh
pnpm test
pnpm eval
pnpm build
pnpm exec playwright install chromium webkit
pnpm test:e2e
pnpm test:webkit
```

Run `pnpm preview` after building to inspect the production app. React and strict TypeScript are used for the application. Content lives in `src/content/`; `src/prompts.ts` exports the conversation starters, reviews, and combined library.

- [Content and interface conventions](docs/content-guide.md)
- [Evaluation results and limits](docs/evals.md)
- [Evaluation methodology and fixtures](evals/README.md)

## Deployment

GitHub Actions runs the release checks before deploying main to GitHub Pages. The generated `dist/` directory also works on a static HTTPS host. Relative assets and hash navigation support subdirectory hosting and offline collection links.

Project code and documentation use the [MIT License](LICENSE).
