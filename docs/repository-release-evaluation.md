# Repository-wide release evaluation

The release review refreshed real text API execution across the application’s current prompt corpus and reviewed 140 source/configuration/test files in 26 AI-review batches. One functional issue was reproduced: full review cards could duplicate a source sentence across questions. The revised full prompt defaults to one useful card, retains explicitly requested batches up to eight, uses one question format per set, and requires complete restored sentences for gap answers. A spoken vocabulary fallback was clarified to exclude new examples and vocabulary breakdowns.

No unresolved release-blocking product defect was confirmed after source inspection, targeted browser probes and the complete local release checks. This is an evidence-based release decision, **not a claim that every raw AI verdict passed**. All target and judge executions use the same pinned `gpt-4.1-2025-04-14` snapshot. Text-only execution does not validate real microphones, other AI products or learner outcomes.

## Functional execution coverage

| Suite | Scope | Final raw model result | Static review applied |
| --- | --- | --- | --- |
| Speaking, scenarios and review | 562 cases; all 160 scenes in both formats plus interaction/review boundaries | 558 pass, 4 fail | Four documented rubric mismatches |
| Listening, reading and writing | 108 cases across all 18 helpers | 107 pass, 1 fail | One documented source-phrase mismatch |
| English interface payloads | 34 cases | 34 pass | None |
| Actual-history regression | 8 sessions, 32 real target turns | 8 pass | None |
| Authored verification scripts | 7 sessions, 28 real target turns | 6 pass, 1 fail | One count-as-maximum interpretation |
| Saved guide configurations | 7 sessions, 35 real target turns | 7 pass | None |
| Card follow-up probes | 3 cases: two meaning cues, two gaps, no padding from one source | 3 pass | None |
| Complete guides and focused source/docs review | 17 full articles and 5 source/documentation bundles | 22 pass | One changed documentation case rerun; 21 earlier exact-input results retained |

The 562/108/34/8/7 main suites were initially executed afresh for this repository-wide task. After prompt changes, only affected cases or complete affected sessions were executed again; unchanged exact-input targets and judgments were reused. Intermediate failures are preserved in the refinement history. Reusing a response is not a fresh repeated sample. The additional card probes were authored after remediation, so they are tuned regression checks rather than blind independent validation.

The six static reviews do not modify target text or raw model verdicts. Accepted archives retain the raw fail, reason, exact observed reply, original evidence digest and a separately bound `codex-semantic-review` decision. The existing validator checks those bindings. The earlier guide-only supplementary judge conflicts remain recorded as non-accepted observations; this release does not relabel them as successes.

## Why the six behavioral verdicts were reviewed

- A question inside a quoted English example is not an extra directed inquiry.
- A coach may ask the next single question after receiving the learner’s answer; “wait” does not prohibit conversational continuation.
- Three recall questions followed by three matching answers are three questions, not six.
- A compact card can use a genuine learning point from the practice without being exclusively a verbatim error-correction cue.
- “make sure” occurs verbatim in the supplied listening sentence; it is not invented padding alongside “touch base” and “on the same page”.
- Card counts are maxima. A valid single card is not a source-coverage failure merely because more source sentences exist; later turns in that same session produced distinct cards when requested.

These are implementing-agent static interpretations, not human labels or independent-model validation. The raw judgments remain available for disagreement and inspection.

## Source review and reproduced browser checks

All application, scenario/content, persistence, clipboard, offline/update, deployment, evaluation-tool and test sources were assigned exactly once to source-review batches. Binary icons, the lockfile, private notes and large generated evidence archives were excluded from the model source-review input. Existing documentation received the separate focused documentation review.

The raw source-review gate was **24 pass / 1 fail / 1 uncertain**. Some target reviewers also emitted alleged major defects that their judge incorrectly passed. Each alleged material defect was inspected rather than relying on the aggregate score:

| Allegation | Verification and release assessment |
| --- | --- |
| Skip target missing or heading not updated | Six actual browser routes each had exactly one visible dynamic heading; activating Skip focused it. Not reproduced. |
| Decorative logo needs extra ARIA | The image has native empty alt, and the brand link includes visible text. The extra attribute is not a required fix. |
| Listening/reading/writing dialog cannot copy | Its custom footer owns the real handler. Browser delivery matched all 1,444 expected characters. The clipboard API was stubbed for exact-delivery observation. |
| Removing listeners with matching capture but without passive leaks | A native browser add/remove/dispatch probe produced zero calls after removal. Capture matches; passive is not part of removal identity. |
| Ignoring URL search would break routing | This static app uses hash routes. The warning was conditional on a different routing design and is not a demonstrated defect here. Offline and scoped-cache browser suites also passed. |

Supplemental AI review with complete cross-file context and captured browser evidence classified the central allegations as unsupported or contextually minor. Its judge output was invalid/truncated, so it remains uncertain, not an accepted green gate. Static verification and actual browser evidence, rather than a rewritten model score, support the release decision.

## Evidence and reproducibility

- Current accepted main, learning, English, session, frozen and guide execution archives live in `evals/fixtures/` and are checked by `pnpm eval` against current exact inputs.
- `evals/results/2026-11-15-repository-*-initial.json` and `*-raw.json` retain initial and final raw outcomes.
- `2026-11-15-repository-card-refinement-history.json` retains intermediate prompt/refinement failures.
- `2026-11-15-repository-static-reviews.json` binds the six behavioral static reviews to exact evidence.
- `2026-11-15-repository-source-current.json`, `2026-11-15-repository-findings-verified.json` and `2026-11-15-repository-browser-probes.json` retain source-review and browser-probe records.
- `2026-11-15-repository-card-heldout.json` contains the three post-remediation card probes.

Reproduce source review or existing functional suites using `evals/export-live.ts` and `evals/live.py`; these make paid API calls when invoked live. `--repository` exports the complete source-review manifest. Ordinary `pnpm eval` validates existing evidence only and reports non-accepted observations separately. Historical station-review evidence is retained in its original archive so refreshing current frozen sessions does not silently rebind an old semantic judgment to a new reply.

## Release verification

Run `pnpm test`, `pnpm eval`, `pnpm build`, `pnpm test:e2e` and `pnpm test:webkit`. Local browser suites separately verify routing, exact copy payloads, ordering, manual fallback, focus, scrolling, bilingual persistence, cross-window state, offline readiness and real service-worker updates. No physical installed-iPhone test or real audio test was performed.

Deployment follows the existing GitHub Actions workflow: main push, full checks, Pages artifact upload, then GitHub Pages deployment. A successful local run does not establish a successful remote deployment; confirm the Actions run and served artifact separately.
