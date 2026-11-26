# AI distribution maintenance

Canonical content remains in `src/content`, `src/prompts.ts`, `src/scenes.ts` and the existing prompt composition functions. `distribution/config.json` owns channel names, version and optional verified endpoint. `distribution/guidance.json` owns shared learning boundaries. Generated files must not be edited independently.

```sh
pnpm sync
pnpm distribution:check
pnpm docs:check
pnpm ai:build
pnpm mcp:test
pnpm mcp:build
pnpm test
pnpm eval
pnpm build
pnpm test:e2e
pnpm test:webkit
```

Python 3 is a maintainer-only requirement for deterministic ZIP generation. Generated archives, checksums and Worker bundles are ignored; generated Markdown and channel manifests are checked in. A clean checkout must run `pnpm sync` before MCP tests/builds. CI performs that regeneration and then checks tracked output drift.

## Release policy

Bump the AI version for changed release inputs. The unified Check and deploy workflow runs on main pushes or manual dispatch. Release publication waits for successful Pages and MCP deployment, including remote health, protocol and icon verification. It validates and uploads all configured archives and the full Markdown file plus SHA256SUMS under `vVERSION`, records the exact bootstrap source SHA while retaining stable latest-entry URLs and refuses to overwrite a changed release under an existing tag; an identical published identity is reused. The lightweight Skill and plugin channels follow the latest remote entry; the full Skill embeds a versioned snapshot and requires replacement to update. Normal document updates do not require client reinstallation. Within an active task, retain the selected instructions; new sessions reload the entry. Changing a published version must fail; identical retries retain existing assets. Bump the version rather than replacing assets. Web app downloads are built from the deployed source SHA.

Pages deployment uses the existing main workflow. Remote MCP deployment uses the selected OctopusGarage account, the repository CLOUDFLARE_API_TOKEN secret and MCP_ENDPOINT variable. CI deploys the exact uploaded Worker build, rather than rebuilding after tests. The separate manual MCP workflow is a recovery entry point. A public endpoint remains unavailable until deployment and health/protocol verification succeed. Publishing packages does not publish a public ChatGPT/Claude directory listing.

Never copy Panfolio account identifiers or unrelated service configuration. Keep English documentation, stable IDs, bilingual UI and evidence distinctions. Refresh affected archived model evaluations when their bound prompts, articles or reviewed source files change; transport/package tests do not establish provider audio compatibility or learning outcomes.


## Publication failure recovery

GitHub may accept tag creation before the ref is visible to a following GET. Publication checks visibility up to four times with 1, 2 and 4 second waits. Only a missing ref is retried; revision mismatches and authentication/API errors fail immediately. Existing tags are never moved. An interrupted draft upload resumes with the same verified manifest; an identical published retry downloads and validates every asset before skipping. Retry the failed release job to reuse tested artifacts. Changes to published release inputs require a new AI version.

The normal unit suite executes the actual publication entry point against a fake GitHub CLI in temporary directories. It covers delayed tag visibility, conflicting refs, bounded timeout, partial upload recovery and immutable published retries. This complements archive integrity checks; it is not a real GitHub failure-injection or deployment test. Custom package output is also tested with the default download directory absent. CI generates ignored MCP data before type checks and compares tracked generated files, so a warm local build cannot substitute for clean-checkout preparation.
