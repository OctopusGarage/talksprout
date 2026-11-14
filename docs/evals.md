# Evaluation Report

## Scope

The supplementary directory contains 18 listening, reading and writing prompts. `learning-static.json` retains separate editorial reviews, while `learning-live-api.json` records 108 real GPT-4.1 text target/judge executions. `pnpm eval` checks both, together with the 562 current speaking/review cases. Browser tests independently check bilingual navigation, exact clipboard content, accessible sheets and layouts. No actual audio or learning-outcome tests were performed.

The original comprehensive release had **670 accepted exact-input text cases**, with **667 raw pass, three fail and zero uncertain**. Those three failures are confirmed judge errors with bound static semantic adjudications; actual failures were fixed and re-executed. The optimization refresh below updates affected records and adds separate suites. Follow-up assistant histories are authored seeds, not end-to-end model conversations. Unchanged cases from the same full run were reused only during targeted retries. Earlier six- and eighteen-prompt UI checks did not include these real model runs.

Release evaluation on 2026-11-14 covers nine coaching modes, four review modes, and 160 optional presets (31 everyday, 13 travel, 12 services, 48 workplace, 56 interview). Static composition, authored reference simulations, real text API execution, and browser/PWA tests are separate evidence types.

| Check | Release result |
| --- | --- |
| Authored opening / teaching / spoken / review references | 9 / 11 / 11 / 15 accepted cases |
| Authored scene references | 79 accepted cases; 51 added references are authored, not API runs |
| Complete composition matrix | 936 coach/scenario/pace combinations, 1,872 payloads |
| Real GPT-4.1 text API cases | 719 accepted cases across five target archives; 764 final target responses; raw case gates 715 pass, 4 fail, 0 uncertain; eight calibration examples counted separately |
| Static semantic adjudication | 4 confirmed judge false positives accepted; raw verdicts retained |
| Unit tests | 106 passed |
| Chromium browser tests | 75 passed |
| WebKit browser/PWA tests | 55 passed |
| TypeScript and production build | Passed |

The current application checks passed 106 unit tests, 75 Chromium browser tests and 55 WebKit browser tests. The recorded API suites are separate from these application checks.


The 46 base references and 79 scene references are authored text simulations, not external-provider API runs. The separate live API corpus below contains real executions. Neither corpus is evidence of learning effectiveness or broad provider reliability. Fixtures contain exact prompt hashes; changed text requires refreshed sessions. See [methodology](../evals/README.md) and [fixtures](../evals/fixtures/).

The expanded catalog has real text API coverage for all 160 scenes. The fixed live manifest has no pending current scenes; future catalog additions remain pending until executed. Authored references and static checks remain separate from model execution. Browser coverage includes five-category browsing, exact copied payloads, topic compatibility, bilingual search and nested swipe-back dismissal that preserves the parent prompt and optional background.

## Recorded real API evaluation

The [accepted archive](../evals/fixtures/live-api.json) contains 562 current-input text cases against `gpt-4.1-2025-04-14`, covering every scene in both formats with a recommended coach, technical mock interviews, all base coaches, reviews and interaction edge cases. Real API coverage is narrower than the full static matrix of 936 combinations.

The original speaking archive had 560 raw pass and two fail. Its current targeted refresh has 559 raw pass and three fail, with bound static adjudications accepting the single-question gentle-coach follow-up, a one-card past-tense exercise grounded in actual hiking practice, and the tense-unmarked Chinese cue with a source-grounded past-tense answer. The supplementary archive's raw results are 107 pass and one fail, with a static adjudication confirming that “make sure” occurs in the source and is a permitted selection. Each adjudication binds the exact input, observed reply, raw judgment and pre-adjudication evidence digest. No actual violation is waived.

The comprehensive first run exposed four actual issues: a spoken role-play turn asked two questions; vocabulary review included instruction-only wording; cards repeated the same past-tense target across formats; and an email rewrite claimed meaningful shortening with effectively unchanged length. Updated prompts constrain whole-reply question counts, require source headwords, merge inflections, deduplicate learning targets and check shortening. Further checks exposed compact-card duplication and source/output-branch mistakes. The final compact prompt applies the first matching branch: oral-only recap when writing is unavailable; an exact request when learner practice is absent; otherwise one grounded card. Affected targets and judges were re-executed; unchanged exact-input records from the full run were retained. `results/2026-11-14-comprehensive-findings.json` preserves the flagged original outputs, including both real issues and judge mistakes.

The 108 supplementary probes cover all 18 prompts with missing input, normal material, help, stopping, quoted-instruction isolation and follow-up checks. Each uses an isolated same-model judge call. Follow-up histories are authored synthetic context. Four affected authored reference outputs (role-play spoken, vocabulary full, cards full and cards spoken) were explicitly re-reviewed and retained with updated provenance and prompt hashes. The missing-history spoken-card reference was reauthored to the new exact request. These authored updates are distinct from API re-execution.

These are text evaluations. They do not establish audio recognition, pronunciation assessment, physical iPhone PWA gesture compatibility, learning effectiveness, long-session reliability or compatibility with other providers. `pnpm eval` validates recorded evidence without network calls; `pnpm eval:live` performs optional paid API requests.

## Spoken openings

All nine modes include a separate compact English opening. Text simulations check that brevity preserves the distinctive coaching sequence. Browser checks cover reading view, keyboard tabs, exact copying of each selected format, manual-copy fallback, and English mobile accessibility. Reading times are estimates; no microphone recognition or real spoken-performance comparison has been conducted. Compact instructions omit detailed edge-case rules, so equivalence with the full prompt is not established.

## Post-conversation reviews

Four reviews have separate full and spoken simulations; additional cases cover another-transcript source isolation and missing context. These are authored text examples, not API execution or independent evidence of reliability. They check genuine errors versus optional style, speaker attribution, contextual vocabulary, reference IPA uncertainty, self-contained recall questions with a separate answer key, and oral fallback when written output is unavailable.

Browser checks cover purpose separation through search, favorites, counts, browser Back and reload; exact copying of current-chat, transcript-template, and spoken payloads; source reset and manual-copy selection; offline review access; bilingual mobile layouts and accessibility scans.

## Teaching coverage

- Natural conversation: acknowledge meaning, correct one genuine language issue, then ask a related follow-up.
- Gentle coaching: bridge Chinese or fragmentary answers into simple English without shaming or forced repetition.
- Focused correction: remain on the retry until it works; do not advance the conversation prematurely.
- Score and rewrite: respond to a request for informal wording assessment, provide a useful revision, and wait for a retry.
- Role-play: respond in character, give a short coaching note, and continue the scene without providing all learner lines.
- Debate: engage with the argument while distinguishing language errors from a different opinion.
- Vocabulary game: elicit a learner sentence and correct its usage before another round.
- Visual description: ground feedback in the image or learner description without claiming missing perception.
- Retelling: let a short section finish, correct contextually wrong words, then discuss its meaning.

## Experience coverage

Start practice shows three directories and no prompt-card wall; Wrap-up & Review has its own independent entry and four review choices. Each collection has two to four prompts. Practice-home search covers all coaches, collection searches stay within the selected collection, and review results remain separate. Saved filters and counts follow the same scope. Checks cover deep links, browser Back, exact clipboard text, manual copying, modal feedback, focus restoration, stale favorites, bilingual persistence, offline reload, startup failure recovery, isolated cache cleanup, and layouts from 320px to desktop.

Axe checks detect no WCAG A/AA violations in the tested directory, collection, coaching/review dialog, Settings, information-sheet, and recovery states. This is not complete accessibility certification.

## App-frame coverage

Browser checks exercise a bounded document viewport, fixed headers and phone navigation, a content-only scroll region, independent tab/collection filters and scroll restoration, desktop sidebar layout, routed prompt sheets, focus restoration after Back, and a copy action that stays visible during sheet scrolling. Additional checks cover Settings language controls, installation/instruction sheets, deep links, reduced motion, and simulated `visualViewport` keyboard resizing, zoom cleanup, and rotation.

The keyboard cases simulate viewport events in Chromium and WebKit; they do not establish actual iPhone/Android keyboard or installed-app behavior. The WebKit clipboard case uses a capture adapter to verify the application payload; actual system clipboard access and permission fallback are covered separately in Chromium. The 18 WebKit app-frame, focus, and clipboard cases run in CI alongside the full Chromium suite. These browser results are separate from the archived prompt simulations. UI-only changes do not refresh those text examples.

## Independent audit: 2026-11-13

Audit target: the app before the remediation follow-up below. This audit combines fresh release checks, exploratory browser probes, isolated build/fixture mutations, and three separately prompted AI reviewer contexts. Reviewer contexts do not establish model diversity or independent provider execution. No runtime code or prompt bodies were changed during the audit.

| Fresh evidence                | Result                                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing release checks       | 17 unit, 29 Chromium, and 9 WebKit tests passed; production build passed.                                                                                                       |
| Archived prompt records       | All 37 records validated against current instruction hashes; no fresh target-model inference.                                                                                   |
| Expanded accessibility checks | 70 Chromium A/AA scans across both interface languages, six main views, all 13 full/spoken prompt sheets, both settings sheets, and recovery: no detected violations.           |
| Expanded layout checks        | 100 states: six views at four viewport sizes in both languages, plus all full/spoken sheets at 320px: no horizontal overflow or document-scroll overflow in the checked states. |
| Delayed clipboard completion  | Two state-consistency defects reproduced with controlled asynchronous clipboard promises.                                                                                       |
| Service-worker lifecycle      | First-visit update defect reproduced with real Chromium workers on a local production server under `/talksprout/`; a returning-visit control reloaded correctly.                |
| Public-only build change      | Changing only the manifest changed its output but left the worker byte-identical in two isolated builds.                                                                        |
| Fixture-validator mutations   | Six intentionally invalid or insufficient fixture sets were accepted with exit code 0 and no reported issues.                                                                   |

### Findings at the audited revision

The findings below were P2 issues in the pre-remediation app. They are preserved as historical evidence; the remediation follow-up below records the fixes and new regression coverage. The earlier passing tests did not cover these triggers.

1. **Copy results are not scoped to their initiating context.**
   - Start a quick copy, navigate to Review, then reject the pending clipboard request. The app reopens the old coach and returns to its captured practice route.
   - Start copying the full Natural Conversation Coach prompt, switch to its spoken format, then complete the old request. The spoken view displays a copied state, although the recorded payload is the 309-word full prompt rather than the 65-word spoken opening.
   - These probes use controlled clipboard promises, not measured OS permission-dialog timing. They demonstrate a reachable UI-state race, not the frequency of real-world occurrence.
   - Scope copy feedback and fallback to an operation ID, prompt, format, source, and current navigation context. Dismissed or superseded operations must not reopen sheets or mark a different payload copied. Concurrent recent-copy updates should use current state rather than a captured history list.

2. **An update accepted during the first visit does not reload the app.**
   - On an initially uncontrolled page, the first worker claims the client. A second worker is then installed and the user accepts Update and reload. A controller-change event occurs, but the page-load count stays at 1 and the update button remains visible.
   - Control experiment: after a manual reload, accepting another worker update increases the load count from 2 to 3.
   - The flag remains false for the lifetime of the first page. Track control transitions or explicit user update intent; suppress the initial claim only, rather than every later controller change in that session.

3. **Manifest/icon-only releases can retain stale offline assets.**
   - In an isolated project copy, change only `public/manifest.webmanifest` and build again. The emitted manifest changes, but the generated worker and cache key remain unchanged.
   - Precaching includes fixed public URLs, while versioning excludes their bytes and serving is cache-first. Existing clients therefore have no worker-content change that reliably triggers recaching those assets.
   - Include all precached public assets in the version digest. Add a build-level check proving that a public-asset change produces a new worker version.

4. **The archive validator is weaker than its advertised coverage and transcript guarantees.** Each mutation below was executed in a temporary project copy; the original fixtures were unchanged. Every run returned exit code 0 and `issues: []`:

   | Mutation                                                                                        | Missing guard                                                                           |
   | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
   | Empty the entire multi-turn teaching suite.                                                     | No required teaching-mode coverage.                                                     |
   | Replace turn contents with empty assistant text and null learner content, retaining role names. | No nonempty string validation or consistency check for duplicated turn arrays.          |
   | Replace one coaching opening with a valid review prompt and its hash.                           | Cardinality is checked instead of the expected purpose-specific ID set.                 |
   | Change spoken records to full variants and full-prompt hashes.                                  | The spoken suite does not require the spoken variant.                                   |
   | Change every judgment to partial.                                                               | There is no release acceptance threshold or explicit waiver policy for partial results. |
   | Remove the transcript-isolation case while retaining missing-transcript handling.               | A transcript-source flag alone does not establish actual isolation coverage.            |

   Tighten schema, expected mode/variant sets, and scenario requirements; detect changes in source transcripts and other response-generating inputs. Define how partial results affect release acceptance. Separately, a static archive validator should not be presented as a fresh model-quality evaluation: malformed-data rejection and behavioral judging are different jobs.

### Prompt risks identified at the audited revision

These were static instruction gaps, not demonstrated failures of an external AI service. The follow-up below describes the revised instructions and authored cases:

- **Spoken review recovery:** all four short reviews omit the full version's explicit request for conversation content when no usable practice is available. Test empty chats, one-greeting chats, and partial history. The model should request context or state a limited scope instead of inventing personal learning material. Preserve this fallback while keeping the scripts short.
- **Clarification during retries:** focused correction and expression rewriting should distinguish an English clarification question from a practice attempt. After correcting “I go there yesterday,” test “Why not have gone?” and an explicit skip request. Explain briefly, preserve the pending exercise, and let the learner resume or skip without treating the question as an answer to grade.
- **Voice-only complete notes:** the short complete-notes script requests IPA but does not explicitly exclude reading symbols in its oral fallback. Test voice-only output and retain a clear “without IPA or worksheets” boundary.
- **Role-play coaching boundaries:** the spoken role-play script compresses the separation between character speech and teaching feedback. Test natural disagreement and help requests; disagreement must not become a language error. A short spoken coaching marker may help.

The current three practice collections and four review choices remain coherent. Focused correction and expression assessment overlap, but this audit provides no behavioral evidence justifying deletion or merging. Clarify their difference and compare identical learner responses before changing the catalog.

### Remediation plan from the audit

1. Fix asynchronous copy-state consistency; add delayed-success, delayed-rejection, format-switch, source-switch, and dismissed-sheet cases.
2. Fix first-visit update reload and public-asset invalidation; cover initial claim, returning visit, and accepted updates with real worker lifecycles.
3. Strengthen archive schema and exact scenario coverage; the insufficient fixture sets above must no longer silently satisfy release requirements.
4. Refine the short review and retry instructions, then evaluate refreshed cases with separately generated target responses and judgments. Include correct answers, unclear intent, missing context, clarification detours, and voice-only output before claiming behavioral equivalence.

The normal navigation, purpose separation, exact immediate copying, manual fallback, offline reopening, and tested accessibility/layout flows have passing evidence. The confirmed issues call for targeted fixes; this audit does not support a broad redesign or additional prompt categories.

## Remediation follow-up

The runtime and instruction fixes now have the following evidence:

| Finding                                         | Resolution and verification                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Delayed clipboard feedback and navigation       | One in-flight browser write, synchronous gesture initiation, current-state recent history, and feedback invalidation on route, sheet, format, source, or language changes. Eight controlled-completion cases cover stale success/rejection, source/format changes, reopening sheets, manual selection, serialization, and unrelated cache warnings. All pass in Chromium and WebKit. |
| First-visit update reload                       | Mutable control tracking suppresses only the initial claim; explicit acceptance reloads once. The real-worker subdirectory test verifies load counts 1 → 2 on first-visit acceptance, 3 → 4 after a manual return visit, and preserves a real favorite and English UI. Waiting for an update alone does not reload.                                                                  |
| Public-only cache updates                       | The digest includes names and bytes of generated assets and all precached public files. Three isolated builds verify manifest-only and icon-only invalidation; recovery is also precached and opens offline in the worker test.                                                                                                                                                      |
| Insufficient archived-eval validation           | Twenty-five validator unit cases cover malformed records, exact purpose/variant coverage, missing teaching/isolation evidence, duplicated turns, strict pass-only release acceptance, and input/response/verdict integrity. The original six insufficient-fixture mutations are rejected even after resealing where structural checks apply.                                         |
| Short-form grounding and conversational detours | Short reviews retain missing-context recovery, bounded selection, and a voice-only recap without IPA/worksheets. Retry coaches distinguish clarification/help from answers and allow resume or explicit skip. Spoken role-play separates character speech from a labeled language note while preserving genuine-error feedback.                                                      |

The earlier remediation checkpoint recorded **43 unit tests, 39 Chromium browser tests, and 18 WebKit cases**, plus build and archive validation. These counts describe that earlier revision, not the current release. The expanded 70-scan/100-layout audit above belongs to the earlier audited revision; it is not relabeled as a fresh run after remediation.

The archive now contains **46 authored cases**: 12 existing cases were refreshed for changed instructions or source data, 9 edge cases were added, and the transcripts and judgments of 25 unchanged-target cases were retained. All records received integrity metadata; that migration is not a new model evaluation. New cases cover clarification, skipping and resuming retries, mixed answers containing social questions, missing review context, and voice-only recap behavior. Instruction scripts remain English-only and at most 85 words.

These changes close the reproduced implementation and validator defects. Authored semantic cases still do not establish reliability across external AI providers, actual microphone recognition, or pronunciation accuracy. See the [methodology](../evals/README.md) for the separation between record integrity and behavioral evidence.

## Limits

Broader provider coverage, microphones, pronunciation, long conversations, physical iOS/Android installation, and learning outcomes remain unverified. This release adds the scoped GPT-4.1 text API evidence described above. Passing short text cases does not establish sustained coaching quality or reliable behavior across external AI services.

## Touch and keyboard focus follow-up

Input modality now controls non-editable focus rings across prompt rows, favorite and copy buttons, navigation, settings, and language options. Pointer input clears decorative outlines without discarding restored focus; keyboard input restores visible focus. Search fields retain their editing cue and manual-copy text remains selectable. A touch-context regression covers sheet return, controlled stale-focus transitions, toolbar controls, language selection, and instructions. Chromium and WebKit emulation do not replace verification on a physical iPhone.

## Scenario preset evidence

The optional scenario layer contains 160 named presets (31 everyday, 13 travel, 12 services, 48 workplace, 56 interview). Its separate archive contains 79 authored role simulations over composed payloads; see `evals/README.md` for representative coverage and limitations. Unselected prompts use the base coach instructions without scenario composition. The release prompt refinements and refreshed reference archives are documented above. Catalog/assembly tests cover all supported combinations; browser checks cover scenario replacement, background editing, both formats, exact clipboard delivery, fallback, stale completions, language persistence, keyboard use and narrow-screen accessibility. These forms of evidence remain separate from the real API text corpus added in this release and from audio/provider testing, which remains unverified.

## PWA update verification

The update manager now publishes immediate progress, observes worker and controller state, polls briefly for confirmed activation, and reconciles on foreground/pageshow/focus/reconnect. After 12 seconds it offers retry instead of silently waiting or blindly reloading. Dedicated session storage supports a brief completion acknowledgment; preferences are preserved. Unit lifecycle simulations cover missed events, timeout/retry, stale workers, initial claim and disposal. Deterministic browser simulations cover visible standalone-state feedback; real local HTTP-served service workers verify actual cache installation, two release cycles, exactly-once reload and offline recovery in both Chromium and WebKit. These browser tests do not replace a physical iPhone Home Screen test.

### Initial-cache update race

The first Linux CI run caught a phantom update banner: the initial worker was already activated, with no waiting/installing worker, but the app still offered an update. A repeated local real-worker test reproduced this under concurrency. The manager now offers only an installed waiting worker that replaces a distinct active worker and is not already the page controller; it also clears a stale offer once that version already controls the current page. A regression asserts no update banner during initial cache installation before testing later releases. No prompt payload changed, so the recorded API evidence remains current.

## Focused end-to-end and English-locale checks

The optimization workflow adds separate English-locale (34 rendered payloads) and tuned regression end-to-end (eight four-turn scripts) suites. The latter feeds actual preceding target responses into subsequent requests; its authored learner scripts do not make it an interactive learner-outcome study. The runner pins `gpt-4.1-2025-04-14` by default, supports exact-input affected selection and validates sealed whole-session resume caches. Reports distinguish newly selected cases from retained historical evidence. See [focused suite methodology and commands](../evals/README.md#focused-optimization-suites-snapshot-pinned).

The first new real runs are retained as flagged historical evidence in `evals/results/2026-11-14-optimization-initial.json`. Their raw judge pass rates are not release acceptance: passing-output review exposed missed multiple questions, repeated card targets and an inaccurate shadowing suggestion. Focused results were accepted separately after correction and review; the historical 670-case suite was not freshly re-executed in full by this optimization.

The accepted focused evidence now adds **34 English-locale cases** and **eight sessions with 32 actual target turns**, with raw passing judgments. Ordinary `pnpm eval` validates these committed archives without API calls. These are separate from the original 670 isolated cases; retained exact outputs during targeted retries are not fresh repeated samples. Intermediate judge mistakes and real failures remain available in the optimization result archives.

The accepted legacy refresh replaces 216 speaking/review records (207 full-payload cases and nine compact cases) and 12 supplementary records while preserving 442 original records. The merged archives retain original alias-request metadata for original rows and exact pinned snapshot/policy provenance for refreshed rows. At that optimization checkpoint, evidence contained **712 accepted cases and 736 final target responses**; raw case gates are **708 pass, four fail, zero uncertain**, with four bound static semantic adjudications. The additional adjudication independently confirms that a tense-unmarked Chinese cue does not assert present tense when the source-grounded English answer remains past tense. This refresh is targeted, not a new comprehensive run or repeated-trial study.


## Judge calibration and frozen authored verification (2026-11-14)

The eight legacy `session-heldout-*` IDs remain stable for archive compatibility. These scripts were used during prompt refinement and are **tuned regression evidence**, not held-out or blind validation. Their archived inputs and outputs are unchanged by this follow-up.

`evals/calibration-cases.json` contains four agent-authored positive/negative pairs: one versus stacked questions, distinct versus duplicate card targets, withheld versus leaked comprehension answers, and preserved past tense versus incorrect “wanted to” → “wanna” advice. Labels and replies are authored expectations, **not human labels or model-generated target evidence**. `evals/calibrate.py` sends each reply and criterion to one isolated real `gpt-4.1-2025-04-14` judge request using the current live policy; expected labels and rationales are omitted from requests. The first run agreed on **8/8** labels (four positive and four negative). Raw judge text, response IDs, usage and evidence hashes are committed in `evals/fixtures/judge-calibration.json`.

`pnpm eval` requires exact examples, unchanged labels, current policy, unique complete pinned executions, consistent raw verdicts and agreement on every example. Disagreement blocks acceptance; there is no relabel-to-pass or calibration adjudication path. These eight examples are a **narrow sanity check**, not a demonstrated judge error rate or general judge reliability. Subsequent real-session raw false passes below show why a perfect calibration score does not establish reliability. This is same-model judging, not independent model diversity.

Four new learner scripts in `evals/frozen-cases.ts` were frozen before their first execution, distinct from the earlier eight scripts. They cover museum ticket exchange, source-grounded distinct review cards, comprehension readiness, and past-tense shadowing preparation. Each has four target turns using actual preceding target replies and a separate isolated same-model judge per turn. These are **frozen authored verification**, not blind independent validation: the implementing agent authored the initial inputs.

The initial four chains ran before prompt changes and received raw judgments of **4 pass / 0 fail / 0 uncertain**, but static review found two question sentences in a listening reply. Later targeted runs exposed answer leakage on generic help and detail questions before the required main-idea question. Another raw failure mistakenly counted an imperative as a second question. All original replies and judge outcomes remain in `evals/results/2026-11-14-frozen-verification-initial.json`, the `listening-followup-*` archives, and separate evidence-bound static findings. Raw passes are not relabeled as clean behavioral evidence. The generic comprehension rules and affected archives were updated; model outputs were not rewritten to fit expectations.

The library, kitchen and volunteer scripts became **tuned regression** through remediation. Three unaffected original chains retain their first-run outputs. A final station-announcement script was supplied by a separate reviewer context and run once after the earlier hint and question-order checks stabilized. Reviewer authorship does not make it blind independent validation. No further prompt tuning followed that execution. Exact classification metadata is required by the frozen archive validator.

Only affected exact inputs are refreshed: twelve supplementary cases for the two comprehension-check prompts and two English-locale cases, while 96 supplementary and 32 English rows remain unchanged. The older eight-session regression archive and 562-case speaking/review archive are retained. There was no broad rerun of all 712 earlier cases. Human observations remain unperformed; these calls do not establish audio support, other-provider compatibility, learning outcomes or physical-device behavior.

Opt-in commands require an existing `OPENAI_API_KEY` environment variable; credentials are supplied only through curl stdin:

```sh
pnpm eval:calibration:live --output .superpowers/model-run/calibration-new.json
pnpm eval:frozen:live --workers 4
```

The calibration runner refuses to overwrite its output. Preserve unsuccessful raw attempts before accepting evidence. Ordinary `pnpm eval` makes no network requests. The eight calibration replies add only judge calls, not target cases. Counts of model calls describe execution provenance, not independent trials or learning outcomes.


The final station help reply says, “Focus on the change in departure location for a specific train. Replay or reread and try again.” Static semantic review accepts this as the explicitly permitted topic cue: it withholds the train/time/platform numbers and bicycle/rear-carriage instruction, rather than giving the complete main idea covering changes and boarding rules. Topic cues necessarily overlap with the source; this does not permit the specific required fact, answer-bearing quotation or a complete answer paraphrase. This is an agent static interpretation of a boundary case, not a human label, independent judge, or waiver. The unchanged raw pass and evidence-bound rationale are retained in `evals/results/2026-11-14-station-semantic-review.json`.

Final accepted evidence adds **seven actual-history chains / 28 target turns**: three retained untuned original chains, three tuned listening regressions, and one first-run reviewer-authored post-remediation station script. The last script has four raw passing turn judgments; no prompt, source, rubric or expected label was changed to fit it. Across all five target archives, the total is **719 accepted cases / 764 target responses**, with raw case gates **715 pass / four fail / zero uncertain** and the existing four bound static judge-error adjudications. The eight calibration examples are separate from target totals. This follow-up produced **100 distinct real target responses and 108 distinct real judge responses**, including calibration, remediation attempts and preserved failures; these are not 100 independent validation trials.

## Saved-state and route consistency follow-up

Local favorites, combinations and recent-copy metadata now merge mutations against fresh persisted state. Browser Web Locks serialize supported multi-window writes; without that API, sequential stale-window merges remain covered but concurrent atomicity is not claimed. Failed writes retain per-item pending intents for the current session. External additions and removals are reconciled while storage is failing, and recovery retries those intents without replacing newer arrays. Tests distinguish permanent write failure, transient failure/recovery, simultaneous combination saves, fallback behavior and normal cross-window removal.

Safe format, source, scene and pace changes replace the current sheet URL; no private background enters it. Picker cleanup returns to the parent entry before replacement. Reload restores the safe selection and drops private background. Current-option persistence tests wait for the completed selection before reloading, since Web Lock transactions are asynchronous. The home list defaults to three combinations and supports bilingual keyboard-operable expansion. Language claims are explicitly limited to review and learning-helper explanations; coach prompt bodies remain unchanged.

The usability materials under `docs/usability/` include task cards, a session record, and blank raw/aggregation CSV headers. No recruitment, interviews, timings or completion results were produced.
