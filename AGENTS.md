# Project Conventions

- Use pnpm for dependencies and scripts, React for UI, and strict TypeScript for application code.
- Write repository documentation and GitHub About text in English. About should describe app features, not implementation technologies.
- Support both Chinese and English in the app UI and preserve the user's language choice. Prompt bodies are English learning instructions and need not be translated.
- Keep prompt IDs stable. Use named typed objects, never positional content tuples.
- Keep temporary agent plans and workflow scratch files out of version control. The ignored workflow directories must not be force-added.
- Distinguish static review, authored model-role simulations, real model/API execution, and browser tests. Never present one as another or claim audio/provider compatibility without evidence.
- Use `pnpm test`, `pnpm eval`, `pnpm build`, `pnpm test:e2e`, and `pnpm test:webkit` for release checks. Update archived evals when prompt text changes.
