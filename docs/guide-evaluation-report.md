# Guide changes: real AI evaluation

This report records the earlier guide-only evaluation stage. The later [repository-wide release evaluation](repository-release-evaluation.md) supersedes its release scope and records subsequent review-prompt changes and fresh full-corpus execution.

The new guide content and configurations were evaluated through real OpenAI API requests using `gpt-4.1-2025-04-14`. One production defect was found and corrected: the gentle companion sometimes requested a retry and asked a separate follow-up in the same reply. The seven current configuration sessions and 22 content/code reviews pass their recorded model judgments. Two supplementary regression sessions remain **raw failures with disputed judgments**, not accepted passes.

## Scope

- All seven exact copyable configurations: five companions and two global instruction settings. Each main session has five learner turns and uses the actual preceding model replies.
- All 17 complete bilingual guide articles, including four full methodology readings, the three AI references, and ten companion guides.
- Five source review bundles: reader/clipboard/CSS; app/routing/state; content assembly and links; browser/unit tests and scripts; README and content documentation. Source files are included verbatim in the archived requests. Internal source inventories and private notes were not submitted.
- Two additional four-turn gentle-companion scripts, authored after the initial defect and before those scripts were executed.

The unchanged main speaking/review and supplementary learning prompts retain their existing archived evidence. `pnpm eval` validates their exact current inputs; those historical suites were not freshly executed by this run.

## Results and reuse

| Stage | Raw result | Fresh target responses | Reuse |
| --- | --- | ---: | --- |
| Initial seven configuration sessions | 6 pass, 1 fail | 35 turns | None |
| Initial article and source reviews | 22 pass | 22 reviews | None |
| Corrected configuration sessions | 7 pass | 5 turns | Six unchanged sessions, 30 turns |
| Corrected article/source reviews | 22 pass | 1 review | 21 unchanged reviews |
| Supplementary regression scripts | 0 pass, 2 fail | 8 turns | None |
| Clarified-criterion rejudging | 0 pass, 2 fail | 0 | All eight target replies retained; eight new judgments |
| Narrow judge sanity check | 4/4 agreed with agent labels | 0 | Four selected prior model replies; four new judge calls |

Across the stages, the evidence records **71 unique target executions and 83 unique judge executions**, deduplicated by provider response ID. Target reviews are AI-generated editorial/static code reviews, not browser runs or observed learner outcomes. The target and judge use the same model snapshot, with isolated judge requests. These are not independent-model evaluations.

## Production correction

The original gentle configuration allowed correction, an invitation to repeat, and conversational continuation without making their ordering precise enough. One response asked both “Would you like to try saying it?” and “What did you buy there?”. A second response repeated the same pattern after Chinese input; the judge incorrectly passed it.

The current configuration introduces a correction as a statement and requires one next move in that reply: either invite a retry and wait, or ask one follow-up and wait. No extra readiness question is allowed. The corrected five-turn session now produces a single retry invitation after each correction, explains a requested grammar point directly, and stops without a new question. The original replies and verdicts are preserved.

## Judge conflicts retained as failures

The extra regression replies have at most one actual directed inquiry per reply. Nevertheless, the judge counted a correction as an additional move, treated a previous turn's invitation as a second current request, or counted a hint as an independent inquiry. Clarifying the criterion did not resolve these false-failure interpretations in the full session context. A narrower four-example check correctly distinguished single invitations from stacked questions, but does not establish reliable judging in complete sessions.

These conclusions are the implementing agent's static interpretation, **not human labels or independent validation**. No target outputs or raw verdicts were rewritten. The disputed regression archive is marked `accepted: false` in the ordinary evaluation summary. Its execution integrity is checked without turning failures into release passes. Raw failures remain visible even when `pnpm eval` succeeds in validating the recorded evidence.

## Evidence

- [Accepted configuration sessions](../evals/results/2026-11-15-guides-original-accepted-sessions.json)
- [Accepted content and code reviews](../evals/results/2026-11-15-guides-original-accepted-review.json)
- [Initial failed sessions](../evals/results/2026-11-15-guides-initial-sessions.json)
- [Initial supplementary regression](../evals/results/2026-11-15-guide-regression-initial.json)
- [Rejudged supplementary regression, still not accepted](../evals/results/2026-11-15-guide-regression-rejudged.json)
- [Four-example judge check](../evals/results/2026-11-15-guide-judge-calibration.json)
- [Evidence-bound agent findings](../evals/results/2026-11-15-guide-static-findings.json)

Cases bind current prompt bodies, article content and reviewed source to SHA-256 digests. Existing archive validation also checks actual history, model snapshots, complete replies, isolated judgments and evidence seals. Modifying accepted content invalidates its archived evidence rather than silently keeping a stale pass.

## Runtime verification and limits

The unit suite, archived-evidence validation, TypeScript checking, production build, Chromium browser suite and WebKit browser suite are separate checks. Browser tests cover exact copied text, manual fallback, delayed-result isolation, bilingual state, direct routes, focus, scrolling, narrow layouts and offline reading.

No real microphone/audio analysis, saved ChatGPT/Claude/Gemini/Doubao assistant configuration, cross-provider compatibility test, proficiency assessment or learning-outcome study was performed. A prompt's approximate 70% English rule remains a natural-language instruction, not a deterministic word-count validator. The results support the tested text scenarios and concrete correction; they do not establish general reliability or an all-green supplementary regression result.
