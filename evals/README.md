# Evaluations

Run `pnpm eval` to validate prompt contracts, authored reference archives, the complete composition matrix, and recorded live API evidence. This command does not generate new AI responses or make network requests.

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

## Composed scenario presets

`fixtures/scene-presets.json` contains 79 authored text cases: the original 28 references plus 48 opening references for all 24 new scenes in full and spoken form, and three new multi-turn examples for social retries, rental background isolation and travel stopping. The original references include retry/clarification, mock interview review, background instruction isolation, and stopping. Cases record the selection, background, pacing, composed payload digest, authored turns, rationale and evidence digest. `scene-validate.ts` rejects stale payloads or evidence and missing original representative, expansion-scene or edge coverage. `pnpm eval` includes this archive.

The selected payloads are distinct from base coach payloads. Release refinements changed the shared full coaching stop rule, composed spoken role-play opening, spoken sentence-review output branch and transcript-source override. Affected authored records were semantically re-reviewed before refreshing hashes and provenance; compatible reference replies were retained, and the missing-transcript reply was re-authored. Unaffected records were preserved. Scenario cases were authored and reviewed for the composed instructions; identical first turns across formats do not establish equal provider behavior. These cases do not represent fresh model/API inference, independent judgments, repeated trials, audio tests, or exhaustive semantic coverage of all 160 presets and coach combinations. Unit tests check catalog integrity and composition contracts for every compatible pair; browser tests cover actual picker, preview and clipboard interactions. Re-review authored outputs and rationales before updating digests after composition changes.

## Live API release evidence

[`fixtures/live-api.json`](fixtures/live-api.json) records 562 real text cases against OpenAI `gpt-4.1` (reported snapshot `gpt-4.1-2025-04-14`). Coverage includes all 160 scene presets in full and spoken text with a recommended coach, all 56 technical scenes in both mock-interview formats, all nine base coaches, natural answers/help/stopping, retry detours, adapted topics, background isolation, and all four reviews with current/missing/transcript/voice-only-text inputs. Static checks separately cover all 936 compatible coach/scenario/pace combinations and 1,872 payloads; real API runs do not cover every combination.

Each target receives the copied prompt as a user message plus synthetic conversation context, without its grading criterion. Every judge request contains exactly one case and uses the same model as the target; this is isolated grading, not an independent judging model. The policy digest includes the one-case batch size. Validators require a distinct recorded judge response ID for each case. A mechanical question-mark count supplements semantic review but cannot detect every compound or quoted inquiry.

The final raw judge result is 561 pass, one fail and zero uncertain. A separate Codex static reviewer accepted the gentle-coach natural-answer case: the learner's previous question had been answered, and the target correctly accepted the natural wording and asked one related follow-up as required. The raw failure, exact reply, payload and original evidence hash remain bound to the adjudication. Final release gates are 562 pass, zero unresolved failures. No actual instruction violation is waived.

Full-suite target execution was repeated during this release. The final archive reuses exact-input targets from the final full run; eight transcript cases changed by the final source gate were re-executed. All 562 replies received fresh, one-case judge requests under the current policy. Later same-release resumes retained only unchanged case records; the changed transcript inputs received fresh targets and judgments. One sample per case does not establish statistical reliability.

The fixed manifest in `live-coverage.ts` now records all 160 scenes. Future additions remain visibly pending until real executions are accepted; missing or modified recorded cases still fail. The full current generator emits 562 cases. After accepting a future expanded real archive, update the manifest and coverage tests together. Exact inputs, policy, execution provenance, summary counts, raw judgments and any adjudications are validated. Digests detect drift; they are not provider signatures.

Historical regression records and the three new `results/2026-11-14-*-findings.json` files retain flagged raw outputs rather than relabeling them as current passes. They document fabricated early-stop progress, extra opening questions, written output during oral-only review, transcript-source mistakes and semantic judge errors. Per-case judging was introduced after batch grading applied absent full-prompt restrictions to compact prompts. These records are flagged subsets, not passing release corpora.

To execute a new opt-in run:

```sh
OPENAI_API_KEY=... pnpm eval:live
# Optional controls, passed to the Python runner:
pnpm eval:live --workers 4 --output .superpowers/model-run/my-run.json
```

Use an existing environment variable or secret manager for the key; never commit credentials. The runner requires Python 3 and curl, uses normal TLS verification, and sends credentials only through curl stdin. It writes raw results into the ignored workflow directory. Review failures before accepting a new release snapshot; do not reseal obsolete results into passes. `--resume` retains only exact-input target samples and checks the grading-policy hash before reusing judgments. The live script can incur API charges; ordinary CI and `pnpm eval` use the committed evidence and need no API key.

The authored reference suites were independently re-authored/re-reviewed for the revised prompts while preserving learner/source inputs. Later refinements retain already fresh examples only after explicit review recorded in their provenance. These authored references remain separate from real API samples. Neither text suite establishes microphone recognition, pronunciation accuracy, physical iPhone PWA behavior, learning outcomes, long-session reliability, or compatibility with other providers. Spoken scripts are text inputs here. Compact review cards cap at three cards; full cards retain the larger maximum.
