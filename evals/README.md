# Evaluations

Run `pnpm eval` to validate prompt contracts, authored reference archives, the complete composition matrix, and recorded live API evidence. This command does not generate new AI responses or make network requests.

## Fixtures

- [Supplementary real text execution](fixtures/learning-live-api.json): 108 real GPT-4.1 target/judge cases across all 18 prompts, separate from static reviews and audio testing.
- [Supplementary learning prompts](fixtures/learning-static.json): 18 static editorial reviews bound to exact prompt hashes. These contain no assistant responses and are separate from the authored simulations and recorded API evidence below.

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

The original comprehensive run executed all 562 speaking/review cases and a separate 108 supplementary cases (670 final exact-input cases in total). Supplementary coverage includes startup/missing inputs, supplied material, help, stopping, quoted-instruction isolation, and seeded follow-ups for every prompt. Follow-up histories contain authored assistant turns: these are real target/judge executions with synthetic context, not end-to-end multi-turn conversations.

The original comprehensive run ended with raw judgments of 667 pass, three fail and zero uncertain across both archives. Separate static semantic adjudications accept three false positives: the gentle coach correctly asks a single related follow-up after an answer; the expression coach selects “make sure,” which is literally present in the supplied source; and a single source-grounded past-tense card is wrongly rejected as unrelated general grammar. Original target replies, raw failed judgments and evidence digests remain bound to those reviews. That original release gate accepted 670 cases with no unresolved actual failure; the targeted optimization refresh below records subsequent evidence separately.

The first fresh full run found actual problems in role-play question counting, vocabulary-source leakage, duplicate card targets and email shortening. Follow-up checks also exposed duplicate compact cards and compact source/output-branch mistakes, which were corrected with an explicit first-matching-branch prompt. Their original raw findings and judge false negatives are retained in `results/2026-11-14-comprehensive-findings.json`. Prompts were corrected and exact affected cases were re-executed. Unchanged records from this same comprehensive run were retained with `--resume`, not presented as repeated fresh samples. All final replies have isolated same-model judge executions. This does not establish statistical reliability or audio compatibility.

The fixed manifest in `live-coverage.ts` now records all 160 scenes. Future additions remain visibly pending until real executions are accepted; missing or modified recorded cases still fail. The full current generator emits 562 cases. After accepting a future expanded real archive, update the manifest and coverage tests together. Exact inputs, policy, execution provenance, summary counts, raw judgments and any adjudications are validated. Digests detect drift; they are not provider signatures.

Historical regression records and the three new `results/2026-11-14-*-findings.json` files retain flagged raw outputs rather than relabeling them as current passes. They document fabricated early-stop progress, extra opening questions, written output during oral-only review, transcript-source mistakes and semantic judge errors. Per-case judging was introduced after batch grading applied absent full-prompt restrictions to compact prompts. These records are flagged subsets, not passing release corpora.

To execute a new opt-in run:

```sh
OPENAI_API_KEY=... pnpm eval:live
# Optional controls, passed to the Python runner:
pnpm eval:live --workers 4 --output .superpowers/model-run/my-run.json
# Separate supplementary suite:
pnpm eval:learning:live --workers 4
```

Use an existing environment variable or secret manager for the key; never commit credentials. The runner requires Python 3 and curl, uses normal TLS verification, and sends credentials only through curl stdin. It writes raw results into the ignored workflow directory. Review failures before accepting a new release snapshot; do not reseal obsolete results into passes. `--resume` retains only exact-input target samples and checks the grading-policy hash before reusing judgments. The live script can incur API charges; ordinary CI and `pnpm eval` use the committed evidence and need no API key.

The authored reference suites were independently re-authored/re-reviewed for the revised prompts while preserving learner/source inputs. Later refinements retain already fresh examples only after explicit review recorded in their provenance. These authored references remain separate from real API samples. Neither text suite establishes microphone recognition, pronunciation accuracy, physical iPhone PWA behavior, learning outcomes, long-session reliability, or compatibility with other providers. Spoken scripts are text inputs here. Compact review cards produce one card when written output and practice are available; full cards retain the larger maximum.

## Focused optimization suites (snapshot pinned)

The opt-in runner defaults to `gpt-4.1-2025-04-14`, rather than a moving alias. `--model` or `TALKSPROUT_EVAL_MODEL` explicitly overrides it. Existing 670-case archives remain historical exact-input evidence; adding a new suite does not re-execute those archives.

`tsx evals/export-live.ts --english` exports 34 English-locale cases: four full reviews, four compact reviews in three contexts each, and all 18 supplementary helpers. They use the same localized payload renderer as the app. Chinese learner source material remains intact; English explanations and meaning cues are requested separately. `--sessions` exports eight held-out, paraphrased learner scripts with four target turns each. These cover coaching, retry, help, stopping, source-grounded review, technical conditions, and summary fidelity. Their learner inputs are authored, but each subsequent request consumes the **actual** preceding target reply. They contain no seeded assistant messages. They are text-only, one sample per scenario, not evidence of learning outcomes or audio support.

```sh
pnpm exec tsx evals/export-live.ts --sessions
python3 evals/live.py --cases .superpowers/model-run/session-cases.json --output .superpowers/model-run/session-current.json
pnpm exec tsx evals/export-live.ts --english
python3 evals/live.py --cases .superpowers/model-run/english-cases.json --output .superpowers/model-run/english-current.json
# No network or credentials required for selection planning:
python3 evals/live.py --cases .superpowers/model-run/session-cases.json --select roleplay-coach --report-only
# Exact changed/new cases only; report records retained historical IDs separately:
python3 evals/live.py --cases .superpowers/model-run/session-cases.json --changed-from evals/fixtures/session-live-api.json --report-only
```

`--select` accepts case IDs or prompt IDs and rejects unknown selections. `--changed-from` compares the complete generated case, including locale, rubric, payload, and learner script. A sibling `.selection.json` records the scope. Selection does not itself establish baseline validity; `pnpm eval` validates accepted archives. `--resume` requires matching case inputs, requested/reported snapshot, completed untruncated target, and valid evidence digest. A policy change discards cached judgments. Sessions are cached as whole chains; a changed learner turn invalidates the chain, avoiding stale descendants. Interrupted partial sessions are re-executed. Do not claim resumed outputs as repeated samples.

### Calibration and passing-output review

The first real optimization runs are preserved in `results/2026-11-14-optimization-initial.json`, explicitly marked historical and not release evidence. They contain 22 English cases and eight four-turn sessions. Raw same-model judges returned 21/22 and 8/8 pass, respectively. Reviewing **passing outputs** found missed constraints: role-play asked two questions in one reply, review cards repeated the same target sentence, and shadowing equated “wanted to” with “wanna.” This is evidence that the raw judge pass rate alone is insufficient. The listening-check failure also confused a question with revealing its answer, while readiness sequencing needs separate review.

Calibration should retain paired, clearly labeled examples: a one-question role-play response versus two questions; two distinct card targets versus paraphrased duplicate targets; a question that withholds an answer versus an answer leak; and a past-tense-preserving pronunciation suggestion versus deletion of the past marker. Any authored calibration examples are rubric probes, not API outcomes. Review all flagged cases and sample passing outputs across task families before acceptance; report raw judgments separately from static semantic adjudication. The mock-transport runner test verifies history/cache plumbing only and never represents a provider execution.

Targeted refreshes of the original alias-requested archives retain the original top-level request/policy metadata. New rows bind their own `requestedModel` and `judgePolicySha256`; validators check these against the reported target/judge snapshot and current policy. `merge-live.ts baseline refresh output base|learning` validates the full combined archive before writing and records refresh date, exact IDs and source-file digest. Unchanged rows remain original execution evidence, never new snapshot requests. Changing either a refreshed row's model or policy fails validation even after resealing its integrity digest.

End-to-end judgments use `isolated-turn-prefix-v1`: each turn gets a separate same-model judge call with its own criterion and actual conversation prefix. The session gate takes the worst turn judgment. This method is bound into the session policy hash; switching it rejudges cached exact targets without re-executing them. Rubric-only changes likewise reuse sealed targets only when messages, maximum tokens and learner-input sequence are identical, and always discard old judgments. Archive `targetReuseSummary` records reused versus executed cases.

The accepted focused archives are [`english-live-api.json`](fixtures/english-live-api.json) (34 isolated cases) and [`session-live-api.json`](fixtures/session-live-api.json) (eight sessions, 32 target turns). Both have raw passing judgments after affected prompt corrections and rubric calibration. Their target/judge snapshots are pinned. `pnpm eval` checks exact rendered inputs, evidence seals, each session's actual reply history, isolated per-turn judgments and worst-turn gate. Intermediate outputs and raw false positives/false negatives remain separately archived under `results/2026-11-14-optimization-*`; final samples retained during exact-input resume are not independent repeated trials.

The accepted optimization refresh replaces **216 of 562** base records and **12 of 108** supplementary records; **442 original records remain unchanged**. Refresh metadata records exact IDs, counts, snapshot policy, date and source digest. Across the four current archives there are **712 accepted cases** (670 isolated legacy cases, 34 English cases and eight sessions), representing **736 final target responses** because each session has four turns. Raw case gates total **708 pass, four fail, zero uncertain**. Four bound static semantic adjudications accept judge false positives: three retained original reviews and one independently reviewed tense-unmarked Chinese cue. Actual role-play, duplicate-card, translation-classification and tense-loss failures were corrected and affected cases re-executed; their raw findings remain separate. Retained exact outputs across retries are not new independent samples.

English compact coverage adds three single-turn contexts for each of the four spoken reviews: supplied hiking practice, missing history, and a hypothetical writing-unavailable fallback. The hiking histories include authored learner and assistant seeds; only the resulting target and judge calls are real API executions. These 12 cases are separate from the eight actual-response end-to-end sessions. The fallback is evaluated as text suitable for reading aloud, never as actual audio or evidence of a voice provider's behavior. Passing-output review found instruction-source leakage, wrong output-branch selection and mismatched recall answers; original raw results remain in `results/2026-11-14-english-spoken-*.json`.

Compact vocabulary now requests one source expression with a meaning, collocation, labeled new example and key-word IPA when writing is available; the full version retains its maximum of ten items. Missing practice requests the conversation; an earlier explicit spoken-only limit produces a brief oral recap. Final cases preserve the same seeded histories across prompt revisions. The 12 compact English cases were added without re-executing the original 22 English targets, and the end-to-end suite remains eight sessions.
