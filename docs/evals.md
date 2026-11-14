# Evaluation Report

## Scope

Release evaluation on 2026-11-14 covers nine coaching modes, four review modes, and 136 optional presets (32 everyday, 48 workplace, 56 interview). Static composition, authored reference simulations, real text API execution, and browser/PWA tests are separate evidence types.

| Check | Release result |
| --- | --- |
| Authored opening / teaching / spoken / review references | 9 / 11 / 11 / 15 accepted cases |
| Authored scene references | 28 accepted cases |
| Complete composition matrix | 800 coach/scenario/pace combinations, 1,600 payloads |
| Real GPT-4.1 text API cases | 514 accepted; raw judge 513 pass, 0 fail, 1 uncertain |
| Independent semantic adjudication | 1 imperative-opening false positive accepted; raw verdict retained |
| Unit tests | 65 passed |
| Chromium browser tests | 50 passed |
| WebKit browser/PWA tests | 30 passed |
| TypeScript and production build | Passed |


The 46 base references and 28 scene references are authored text simulations, not external-provider API runs. The separate live API corpus below contains real executions. Neither corpus is evidence of learning effectiveness or broad provider reliability. Fixtures contain exact prompt hashes; changed text requires refreshed sessions. See [methodology](../evals/README.md) and [fixtures](../evals/fixtures/).

## Real API evaluation for this release

The [live archive](../evals/fixtures/live-api.json) records 514 isolated cases against OpenAI `gpt-4.1`, reported as `gpt-4.1-2025-04-14`. The suite exercises every preset's recommended coach in full and spoken text, every technical mock scenario in both formats, all base coaches and review purposes, and help, stopping, correct answers, retry clarification/skip/success, background isolation, missing context, transcript isolation and a text simulation of voice-only fallback.

Separate same-model calls judge responses, augmented by a mechanical opening-question check. Final raw judgments are **513 pass, zero fail and one uncertain**. A separate Codex reviewer accepted the uncertain case because “Please send a photo or describe the object…” is a valid concise startup request without a question mark. Its input, response, raw judgment and original evidence hash are preserved with the adjudication. There is no waived strict failure in the current release corpus.

[Historical findings](../evals/results/2026-11-14-regressions.json) retain failed outputs from refinement rounds. These drove concrete one-focus openings, pending-task help, stop priority, natural-description acceptance, grounded shorter cards, and explicit missing-context/oral branches. Prompt changes invalidate corresponding payload evidence. Within the release session, target responses are reused only for identical complete inputs; changing judge policy or model invalidates cached judgments. Previously generated authored references were re-authored/re-reviewed separately, preserving source/learner inputs.

The live corpus is one text sample per current case. Same-model grading is correlated and required the documented independent adjudication. It does not establish microphone recognition, pronunciation quality, physical iPhone PWA behavior, long-session stability or compatibility with other providers. `pnpm eval` validates committed evidence without making new API calls; `pnpm eval:live` performs optional new calls using an environment-provided key. See [methodology](../evals/README.md).

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

The optional scenario layer adds 136 named presets (32 everyday, 48 workplace, 56 interview). Its separate archive contains 28 authored role simulations over composed payloads; see `evals/README.md` for representative coverage and limitations. Unselected prompts use the base coach instructions without scenario composition. The release prompt refinements and refreshed reference archives are documented above. Catalog/assembly tests cover all supported combinations; browser checks cover scenario replacement, background editing, both formats, exact clipboard delivery, fallback, stale completions, language persistence, keyboard use and narrow-screen accessibility. These forms of evidence remain separate from the real API text corpus added in this release and from audio/provider testing, which remains unverified.

## PWA update verification

The update manager now publishes immediate progress, observes worker and controller state, polls briefly for confirmed activation, and reconciles on foreground/pageshow/focus/reconnect. After 12 seconds it offers retry instead of silently waiting or blindly reloading. Dedicated session storage supports a brief completion acknowledgment; preferences are preserved. Unit lifecycle simulations cover missed events, timeout/retry, stale workers, initial claim and disposal. Deterministic browser simulations cover visible standalone-state feedback; real local HTTP-served service workers verify actual cache installation, two release cycles, exactly-once reload and offline recovery in both Chromium and WebKit. These browser tests do not replace a physical iPhone Home Screen test.
