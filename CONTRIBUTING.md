# Contributing

Use pnpm, React and strict TypeScript. Read [project conventions](AGENTS.md), [content guidance](docs/content-guide.md) and [distribution maintenance](docs/distribution-maintenance.md). Keep prompt IDs stable and preserve Chinese/English UI behavior.

## Repository hygiene

Commit product code, canonical content, maintained documentation and necessary application tests. Temporary plans, logs, debugging notes and model outputs belong in ignored `.superpowers/`, not in commits. Never force-add ignored build artifacts. Do not reintroduce retired model-evaluation pipelines or archives without an explicit request.

Prefer an existing module or script over another implementation of the same responsibility. Remove superseded files and update their references in the same change. User-facing text should describe current behavior, without conversation history, debugging chronology or stale test counts. Keep release notes specific to the release.

Before committing, inspect `git diff --stat`, `git diff --check` and every added path. Explain the purpose of new scripts and large files. `pnpm test` checks for common temporary artifacts and retired tooling.

## Verification

Run the documented unit, build and browser checks before release. Describe static review, actual model execution and browser behavior accurately; never claim provider/audio compatibility or cloud saving without direct evidence. Tests should verify meaningful behavior rather than duplicate implementation details.
