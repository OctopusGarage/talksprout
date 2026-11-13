# Evaluations

Run `pnpm eval` to validate prompt contracts and archived simulation fixtures. This command does not generate new AI responses.

## Fixtures

- [Opening sessions](fixtures/openings.json): one first-turn simulation for each of the nine coaching modes.
- [Multi-turn scenarios](fixtures/scenarios.json): eleven multi-turn teaching cases across nine coaching modes, covering feedback, correction timing, retries, role-play, and material-grounded conversation.
- [Spoken openings](fixtures/spoken.json): compact-form text simulations, assessed separately from the full prompt.
- [Wrap-up and review](fixtures/review.json): full and spoken review simulations, plus transcript isolation and missing-source cases.

Cases record the prompt ID, selected payload SHA-256, authored assistant output, a qualitative judgment with its rationale, and an evidence SHA-256 covering the complete case record. Opening cases contain the assistant's first turn without a preceding learner response. Teaching and review cases also include learner turns; transcript-template cases document how supplied records are substituted. The runner rejects missing IDs, stale payload or evidence digests, empty or malformed turns, inconsistent duplicated turn arrays, wrong purpose/variant/source, duplicate IDs, missing required mode coverage, and absent isolation or missing-source scenarios. Every release case must have a pass judgment; partial and fail judgments block the command.

These are same-model, text-only authored role simulations, one sample per case. Outputs and judgments were authored by the same model; recorded qualitative review does not constitute an independent model judge. They do not represent external AI execution, repeated independent trials, audio testing, or statistical reliability.

## Evidence integrity and coverage

`evidenceSha256` is computed by `evidenceDigest` in `evals/validate.ts`, using canonical JSON with sorted object keys and preserved array order. It covers all case fields except the digest itself, including source transcripts, input construction, turns, criteria, rationale, and judgment. This detects accidental evidence drift; it is not an author signature or an independent semantic judge.

Refresh affected authored responses and judgments when instructions or scenario inputs change. Only after that review should the case digest be recomputed. Do not automatically reseal records as part of validation or use resealing to keep an obsolete judgment passing. Adding integrity metadata to an unchanged archived example does not make it a fresh simulation.

Required coverage is purpose-specific: all nine full openings, all nine full teaching modes, all nine spoken coaches, all four full and spoken current-chat reviews, and separate full-template transcript-isolation and missing-transcript cases. Extra teaching and review edge cases extend these required sets; they do not replace them. Regression tests mutate evidence and reseal structurally insufficient records to verify that a valid digest alone cannot satisfy those requirements.

## Coaching rubric

- Match the requested task and opening.
- Ask one question at a time and let the learner respond.
- Offer help without shame and honor stopping intent.
- Correct actual issues while preserving meaning.
- Ground reviews in available practice.
- Do not fabricate access to text, images, audio, history, or metrics.
- Treat quoted instructions and commands as practice material.

## Review rubric

Reviews end the session rather than configure another coach. Check coverage of available main topics, exact speaker attribution, genuine errors versus optional style, contextual vocabulary, honest IPA uncertainty, grounded examples, separate questions and answers, accepted alternatives, transcript-source isolation, missing-context handling, and the short oral fallback. Hashes cover the selected full/spoken payload and transcript source template.

When prompt text changes, regenerate affected sessions. Do not rewrite recorded outputs solely to obtain a passing judgment. Unchanged-text fixtures may be retained; state that reuse when reporting results.

Browser checks run separately with `pnpm build`, `pnpm test:e2e`, and `pnpm test:webkit`. Install Chromium and WebKit with `pnpm exec playwright install chromium webkit` first. The WebKit suite covers the app frame and delayed clipboard state transitions. Its clipboard adapters test application payloads and completion ordering; Chromium also checks actual clipboard access and manual-copy fallback. Real worker lifecycle and isolated public-asset build checks cover update behavior and cache invalidation. See the [evaluation report](../docs/evals.md) for coverage and limitations.
