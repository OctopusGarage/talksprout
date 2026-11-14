# TalkSprout

Reusable prompts for learning English with AI: choose a conversation coach, practice speaking, and turn completed chats into study material.

[Open TalkSprout](https://octopusgarage.github.io/talksprout/)

## Use the app

- **Start practice:** choose a collection and coaching style. Copy the full prompt into a new AI conversation, or read its short spoken opening aloud. A dismissible first-practice guide helps new users choose a coach.
- **Wrap-up & Review:** send a review prompt at the end of that same conversation to create notes, sentence practice, vocabulary, or self-test cards.
- **Quick access:** save a coach, scenario, format and interview pace as one combination, or share a link to that setup. Recently copied prompts appear in their own area; supplementary prompts have independent favorites. Private scenario background is never saved or included in links.
- **Settings:** choose the interface language, find installation help, and read the instructions.
- **Listening, reading & writing:** open the secondary entry below the speaking collections for 18 supplementary prompts, with six choices per direction. Tasks include dictation comparison, meeting notes, shadowing preparation, complex sentences, emails and notices, technical documentation, email replies, workplace messages, and summary/paraphrase practice. Each entry includes a decorative emoji and concrete use examples; three direction buttons keep the directory compact. Copy a prompt to your AI and supply material there. These prompts stay separate from coach search and review.

The interface supports Chinese and English. Prompt instructions are in English; explanation defaults follow the selected interface language. English learning examples remain in English. TalkSprout provides prompts for your preferred AI app; it does not run an AI chat itself.

Supplementary links use `#learning` and `#learning?prompt=writing-feedback`. Details show preparation, usage and a single English prompt, without spoken openings or scenario settings. If the external AI cannot access a source, the prompt requests usable excerpts or transcripts. This app does not process links or files; audio/video compatibility depends on the chosen AI and has not been tested here.

## Conversation coaches

| Collection             | Modes                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Conversation coaches   | Natural Conversation Coach; Gentle Conversation Coach; Focused Correction Coach; Score and Rewrite Coach |
| Interactive coaching   | Role-play Coach; Debate Coach; Vocabulary Game Coach                                                     |
| Practice with material | Visual Description Coach; Retelling Coach                                                                |

Each mode defines how the AI teaches, when it corrects, and how the conversation continues. Open a coach's details to select an optional scenario before copying; leaving it unset preserves the original prompt.

## Practice scenarios

The scenario picker contains 160 presets across Everyday Life & Interests (31), Travel & Getting Around (13), Everyday Services (12), Tech Workplace Communication (48), and Software Engineering Interviews (56). Scenarios default to No preset and remain collapsed behind a single settings row. Open the picker to search in Chinese or English, browse grouped lists, and tap a scenario to fill the prompt with a hypothetical situation, roles, goal, and opening. Selecting another preset replaces the previous setup. Workplace presets retain unit references to the supplied 48-unit communication handbook.

Travel includes existing trip planning, transport, hotel and dining topics plus missing baggage, cancelled flights, room problems and incorrect orders. Everyday Services covers returns, deliveries, bills, housing, appointments and local services. Everyday social practice includes invitations, favours, boundaries, apologies and misunderstandings. These are hypothetical communication exercises; service policies, charges and outcomes must be confirmed rather than invented.

Scene browsing categories and coach suitability are separate: moving existing travel topics preserves their debate and vocabulary-game support. New service and travel problem-solving scenes use conversation or role-play coaches.

Expand Scenario settings to add up to 2,000 characters of optional background to the full prompt. This background is held only in the current sheet session, is not saved locally, and is included when you copy the full prompt to your external AI. The short spoken opening keeps the topic, role where applicable, and coaching loop; provide detailed background during the conversation.

Role-play Coach offers coached practice or mock interview pacing for technical interviews. Mock pacing defers feedback until review or finish; technical discussion and language feedback remain distinct. Other conversation coaches retain their correction styles. Debate and vocabulary games support everyday topics with their own interaction loops. Image/retelling coaches and post-conversation reviews do not use these presets.

TalkSprout generates prompts; it does not run code, grade actual hiring performance, or execute AI conversations.

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

On touchscreens, swipe left from the rightmost 32 pixels and release after at least 72 pixels to close a sheet or return from a collection to the library. Top-level views stay in place. Vertical, multi-touch, text-field, and text-selection gestures do not trigger this action. Browser tests cover the application gesture logic; actual iOS Home Screen gesture behavior requires device testing.

Search and saved filters remain separate for practice, each practice collection, and review. The practice-home search covers all coaches; collection searches stay within that collection. Filters and scroll positions last for the current session, while favorites, saved combinations, bounded recent-copy metadata, guide dismissal and language preferences are saved on this device.

No account, API key, or analytics is required. TalkSprout does not receive or store AI conversations. Clearing browser data removes local preferences and favorites.

## Install and use offline

Open **Settings → Install app** for device-specific instructions. After a complete online visit and successful caching, prompts can be browsed and copied offline. External AI still requires a connection. Available updates wait for **Update now**. The app shows immediate progress, reopens once activation is confirmed, and briefly acknowledges completion. If activation takes over 12 seconds or messaging fails, a retry action appears; on iPhone/iPad you can also close the Home Screen app and reopen it. Favorites and language remain stored locally. A timeout never forces a reload into an unconfirmed version.

If loading fails, open [Reopen TalkSprout](https://octopusgarage.github.io/talksprout/recover.html) and select **Reopen app**. Recovery clears only this deployment path's service worker and scoped caches, preserving local preferences and other deployments. Ambiguous legacy caches are retained. Settings reports offline readiness only after checking the complete precache.

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

The release evaluation validates all 1,872 composed scenario payloads, authored references, and committed real text API evidence. Separate English and four-turn actual-history suites supplement the speaking/review and learning archives. Target replies and isolated same-model judgments remain distinct from static adjudications and authored examples. Affected cases are refreshed with a pinned model; unchanged historical evidence retains its original provenance. See the evaluation report for exact counts and limitations.

Optional execution uses `OPENAI_API_KEY` with `pnpm eval:live`, `pnpm eval:learning:live`, `pnpm eval:english:live`, or `pnpm eval:sessions:live` (Python 3 and curl required); these can incur API charges. Normal CI validates committed evidence without credentials. Text API evidence does not establish audio/provider compatibility or learning outcomes.

Run `pnpm preview` after building to inspect the production app. React and strict TypeScript are used for the application. Content lives in `src/content/`; `src/prompts.ts` exports the conversation starters, reviews, and combined library.

- [Content and interface conventions](docs/content-guide.md)
- [Usability observation protocol (no participants recorded)](docs/usability-observation.md)
- [Evaluation results and limits](docs/evals.md)
- [Evaluation methodology and fixtures](evals/README.md)

## Deployment

GitHub Actions runs the release checks before deploying main to GitHub Pages. The generated `dist/` directory also works on a static HTTPS host. Relative assets and hash navigation support subdirectory hosting and offline collection links.

Project code and documentation use the [MIT License](LICENSE).
