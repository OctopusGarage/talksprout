# AI infrastructure parity ledger

Reference: OctopusGarage/panfolio, inspected 2026-11-25. This ledger maps infrastructure responsibilities, not cooking-domain features.

| Reference responsibility | TalkSprout implementation | Verification / boundary |
| --- | --- | --- |
| Canonical source and public Markdown | scripts/ai-content.ts, content/{zh,en} | All coaches, reviews, learning prompts, compatible scenarios, mock interview variants and guides |
| Shared identity and guidance | distribution/config.json, guidance.json, identity.json | SHA-256 content, guidance and icon identity |
| Skill and agent metadata | skills/talksprout | Public reading or connected MCP; no runtime required |
| ChatGPT plugin | distribution/plugins/talksprout/plugin.json | Distinct archive; host upload not certified |
| Claude plugin | distribution/plugins/talksprout/claude-plugin.json | Native manifest path in archive |
| Branding | Existing TalkSprout app icon | Reused identity, not reference branding |
| Deterministic packaging | scripts/package-skill.py, package-check.py | Fixed ZIP timestamps, source pinning, checksums |
| MCP | mcp/src | Guide, bounded search, complete document reads |
| Request isolation | Exact document keys, bounded Worker POST | No outbound material fetching or personal state |
| Health identity | /health | Remote availability requires actual deployment |
| App installation destination | Settings AI setup section | Bilingual, copy fallback, three downloads, MCP status |
| User and maintainer documentation | ai-installation.md, mcp-server.md, distribution-maintenance.md | Distinguishes host formats and installation/publication |
| Release CI | pages.yml, mcp-deploy.yml | Preflight, tested-build upload/deployment, remote identity/protocol/icon verification, then immutable publication; resumable drafts |
| Evaluation evidence | Existing prompt evals plus AI transport/package tests | No new model/audio compatibility claim |
| Security and contribution entry points | SECURITY.md, CONTRIBUTING.md | Public content boundary and required checks |

Not yet established: actual ChatGPT/Claude account installation, public directory approval, audio/provider compatibility and learner outcomes. Package/protocol checks and Codex source reviews must not be represented as those observations. The legacy Panfolio cookbook JSON feed is not a TalkSprout requirement because TalkSprout has no previously released JSON clients.

## Verification history

Chromium and WebKit browser suites, MCP wire/unit tests, content/catalog checks, deterministic packaging, immutable release tests, builds and deployment dry-runs are executed independently. The library contains 1,992 documents. Canonical prompt text was not changed.

The initial attempt to refresh source-bound guide reviews through the historical text API returned exhausted quota. Those historical accepted fixtures were preserved. At the user's direction, the current source reviews now run through authenticated Codex with isolated target/judge calls, exact source/request binding and native CLI event provenance. Historical text API evidence and Codex source review remain distinct. Codex initially identified and confirmed bugs in retrieval identity routing, zoom detection, release immutability and overstated browser-test claims; fixes and regression checks passed before accepting the final archive.

## Deployment evidence

The user selected the dedicated OctopusGarage Cloudflare account. Using the user's existing Chrome login, a new account-owned token named `talksprout-github-actions` was created with Workers Scripts Write and Account Settings Read restricted to that account. The deployment credential is configured in TalkSprout's GitHub Actions Secret; it is not tracked or printed. The personal account and Panfolio service were unchanged.

TalkSprout MCP was deployed to `https://talksprout-mcp.octopusgarage.workers.dev/mcp`. Its remote health, complete document reads, protocol initialization/tool list and immutable icon hash were verified with `pnpm mcp:smoke`. The CI deploys the exact tested Worker artifact, verifies its source/content/guidance/icon identity, and requires both Pages and MCP deployment before publishing packages. Failed draft uploads can resume; source revisions and artifact hashes/sizes are immutable under an existing release version.

## Accepted release checks

The final local checks passed: 143 unit/evidence tests, `pnpm eval` with no issues, 110 Chromium browser tests and 90 WebKit browser tests. The installed-app keyboard-zoom addition also passed focused Chromium and WebKit checks. MCP strict TypeScript, SDK protocol tests, generated-channel consistency, package integrity, scoped formatting, documentation links and production builds passed separately. The remote smoke verifier compares complete document text, not just headings.

The accepted Codex archive contains ten exact-source review cases, each with an actual isolated target and judge execution (twenty distinct native CLI thread records). Four failed/disagreed intermediate observations remain archived as non-accepted evidence. These source reviews do not certify third-party account installation, voice behavior or learning outcomes.

Runtime publication evidence is available through GitHub Actions, the versioned AI release manifest/checksums and the deployed MCP health response. Both production entry points share one workflow-level lock. Published tags must resolve to the manifest source revision, and retries verify the actual remote release assets before accepting an existing release.
