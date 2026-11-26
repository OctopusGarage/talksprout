# Project Conventions

- Use pnpm for dependencies and scripts, React for UI, and strict TypeScript for application code.
- Write repository documentation and GitHub About text in English. About should describe app features, not implementation technologies.
- Support Chinese and English in the app interface and user-facing articles. Keep AI-facing documents, Skills and MCP content English-only; explanation language follows the learner’s preference, not document locale. Do not maintain duplicate translated AI libraries.
- Keep prompt IDs stable. Use named typed objects, never positional content tuples.
- Keep temporary agent plans and workflow scratch files out of version control. The ignored workflow directories must not be force-added.
- Distinguish static review, authored model-role simulations, real model/API execution, and browser tests. Never present one as another or claim audio/provider compatibility without evidence.
- Use `pnpm test`, `pnpm build`, `pnpm test:e2e`, and `pnpm test:webkit` for release checks. Review changed learning instructions and verify affected application behavior.

## Repository hygiene

- Commit product code, canonical content, maintained documentation and meaningful application tests only. Temporary plans, logs, debugging notes and model outputs belong in ignored `.superpowers/`. Never force-add ignored artifacts.
- Do not reintroduce `evals/`, model-evaluation pipelines, snapshots or archived runs without an explicit request. Do not relocate them elsewhere in the repository.
- Reuse an existing module, guide or script when it owns the responsibility. Remove superseded files and references in the same change.
- Write about current behavior. Keep conversation history, user-request quotations, debugging chronology and stale test counts out of product copy, Skill instructions and documentation. Release notes describe that release, not the full README.
- Keep public generated content derived from canonical sources. Do not delete distribution documents merely because application code does not import them.
- Before committing, inspect the diff, every added path and large files. `pnpm test` includes lightweight artifact hygiene checks; it must not grow into another model-evaluation system.

- User guides are for quick understanding: explain selection and usage with short steps and useful examples. Keep detailed execution, naming, storage and recovery rules in AI instructions, not repeated throughout user articles. Keep only current usage and maintenance documents in `docs/`; do not add temporary research notes, unexecuted observation templates or workflow plans.
