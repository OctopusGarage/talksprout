# Architecture

TalkSprout supplies English-learning instructions to external AI assistants. The app, public Markdown library, Skills, plugins and MCP share canonical content; TalkSprout does not run the learning conversation itself.

## Content and distribution

| Responsibility | Source or implementation |
| --- | --- |
| Coaches, reviews and learning tools | `src/content/`, `src/prompts.ts` |
| Compatible scenarios and interview pacing | `src/scenes.ts` and scene content modules |
| Bilingual guides and note archiving | Guide content modules and `src/content/study-note-archive.ts` |
| Session routing and contextual choices | `distribution/guidance.json` |
| Channel names, version and endpoint | `distribution/config.json` |
| Public Markdown | `scripts/ai-content.ts` → `content/en/` |
| Lightweight Skill | `scripts/ai-bootstrap.ts` → `skills/talksprout/` |
| Self-contained full Skill | `scripts/ai-full-skill.ts` → `distribution/full/talksprout/SKILL.md` |
| Host plugin manifests | `scripts/sync-ai.ts` → `distribution/plugins/talksprout/` |
| Deterministic archives and integrity | `scripts/package-skill.py`, `scripts/package-check.py` |
| Read-only MCP | `mcp/src/` and the generated bundled library |

`pnpm sync` regenerates tracked content and channel metadata. `pnpm distribution:check` rejects drift. Generated Markdown is versioned for public clients; ZIPs, checksums, Worker bundles and local model outputs are build artifacts and remain ignored.

The AI library and both Skill editions use English instructions, independently of the bilingual app interface. Assistants explain and produce notes in the learner’s preferred language. The lightweight Skill and plugins retrieve current remote guidance. The full Skill embeds a snapshot and requires replacement to update. Both use the same Skill name; users choose one edition. Installing a Skill does not connect MCP or add host permissions.

## App and data boundaries

React and strict TypeScript provide a bilingual PWA with hash navigation, prompt composition, exact clipboard output, local favorites and saved practice combinations. The app can cache its content for offline browsing. External AI access requires that platform's connectivity and capabilities.

Favorites, recent-copy metadata, preferences and saved combinations stay in browser storage. Private scenario background is excluded from saved combinations and share links. There are no app accounts or analytics, and AI conversations are not stored by TalkSprout.

MCP exposes only bundled public documents. Requests use exact document keys, bounded input and bounded lexical search; no private app state, outbound source fetching, model execution or cloud writes are provided. Voice, camera access and saving belong to the external AI platform and its authorized tools.

## Release flow

The main workflow checks sources, generated output, packages, application tests and Chromium behavior before uploading tested artifacts. Pages and MCP deployment use those artifacts. Remote source/content/guidance/icon identity and protocol verification precede immutable release publication.

Both production workflows share a concurrency lock. The manual MCP workflow supports recovery. Deployment credentials remain in the repository secret store, scoped to the deployment account; published assets contain no credentials.

See [distribution maintenance](distribution-maintenance.md) and [MCP configuration](mcp-server.md). Package integrity and local/browser tests do not certify third-party account installation, audio compatibility or learning outcomes.
