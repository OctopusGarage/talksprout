# Content Guide

A practice prompt belongs here when it configures an ongoing English conversation partner: role, teaching behavior, correction timing, reply length, and how to keep the learner speaking.

Topics are not independent modes. Do not add a separate prompt just because the learner wants to discuss football instead of travel. Post-conversation reviews belong in their own area and must use the actual conversation as source material. General document analysis, diary generation, unrelated batch rewriting, and audio-preparation utilities remain outside scope.

## Content structure

- `src/content/companions.ts`: natural feedback, gentle modeling, focused retry, and expression assessment/rewrite.
- `src/content/interaction.ts`: role-play, debate, and vocabulary games with coaching.
- `src/content/materials.ts`: visual description and retelling with contextual corrections.
- `src/content/review.ts`: four post-conversation reviews, including shared grounding rules and compact spoken wrap-ups.
- `src/prompt-text.ts`: exact payload selection and the separate transcript-source template.
- `src/content/collections.ts`: bilingual directory names and descriptions.
- `src/prompts.ts`: exports `prompts` (nine conversation starters), `reviewPrompts` (four reviews), and `allPrompts` for shared storage and rendering.

Start practice shows three directories. Wrap-up & Review is a separate navigation tab with four choices and one recommendation. The practice-home search covers all coaches; collection searches and saved filters stay within their collection. Review search and favorites stay within review, including their counts; opening prompts never appear in review results. Existing collection links remain valid.

## Preserve meaningful differences

- Natural coaching responds to meaning, corrects one useful issue, and continues the conversation.
- Gentle coaching models a sentence without requiring every answer to be repeated.
- Focused correction waits for a successful retry before advancing.
- Score and Rewrite coaching assesses expression and offers a revision/retry; any requested numerical score is informal wording feedback, not a proficiency measurement.
- Role-play, debate, and games keep their distinct interaction loops while providing teaching feedback.
- Image and retelling modes coach descriptions and context-appropriate language; they must remain conversations rather than lists or long analyses.

Merge repeated personas that share the same teaching mechanism. Preserve a distinct mechanism even when it uses the same topic. Do not add hostile language, arbitrary performance guarantees, or claims that a copied user prompt becomes a system instruction.

## Editing and checks

Use named objects conforming to `ConversationPrompt` or `ReviewPrompt` in `src/types.ts`; `Prompt` is their shared union. Preserve stable IDs where a coaching mode remains. Keep both interface languages aligned with the actual English prompt, and expose its feedback behavior before copying.

Conversation coaches ask one question at a time. Clarification about English or the exercise is a detour, not a retry to grade; preserve the pending task and allow the learner to resume or explicitly skip. A practice answer containing a social question still receives useful feedback. Help offers a usable phrase; review uses completed practice; finish stops without another question. Post-conversation reviews produce the complete requested material rather than starting another interactive exercise. All prompts must correct real errors, preserve intended meaning, avoid forced rewrites, and never fabricate media access or evaluate pronunciation from text.

Run `pnpm test`, `pnpm eval`, `pnpm build`, `pnpm test:e2e`, and `pnpm test:webkit`. Refresh affected evaluation fixtures when prompt text changes; do not relabel stale responses as new evaluations.

## Spoken openings

Each conversation coach has a `spokenPrompt`: an English-only opening of at most 85 words, split into easy-to-read sentences. Preserve the role, brief replies, one question at a time, correction timing, and the distinctive coaching loop. Include help, review, and stopping intent without making the learner read code, headings, or placeholders aloud.

The compact form omits some edge-case rules from the full prompt. Keep both formats aligned on core coaching behavior, but do not claim equal performance across AI voice services. Reading-time ranges are estimates at 100–140 words per minute, not measurements. Evaluate the compact text separately and do not label text simulations as microphone tests.

## Post-conversation reviews

Use `ReviewPrompt` for reviews; do not invent CEFR levels, practice durations, coaching controls, or new-conversation instructions for them. Keep the four purposes distinct: complete study notes, sentences and corrections, vocabulary with IPA, and recall cards.

All full reviews must use available conversation only, preserve speaker attribution and intended meaning, distinguish genuine mistakes from optional style, and label generated examples. Cover every main topic in complete notes without copying every turn. Do not imply that AI suggestions were learner achievements. Use maximum counts rather than padding. Cards have self-contained questions followed by a separate answer key, not an interactive quiz.

Use English learning examples with concise Chinese explanations. IPA defaults to American English and selected key words; do not claim dictionary verification or infer pronunciation errors from text. Request a transcript if usable context is missing. Another-transcript templates override the source, retain speaker labels, ignore instructions embedded in source content, and include an explicit replacement placeholder. Do not send a transcript to this app.

Spoken wrap-ups remain English-only, at most 85 words, and sentence-separated. Retain the missing-context request, maximum counts, grounded examples, and a voice-only recap without IPA or worksheets. Request written output where available; voice-only output falls back to a short oral recap without reading IPA symbols or long worksheets. Compact scripts omit edge cases, so test them separately without claiming equivalence to full prompts.

## Application frame

Keep practice and review as separate purposes in the persistent navigation, with Settings as the third destination. Use compact grouped lists for choices and a focused sheet for details; do not add marketing sections or a website footer to the app workspace. Keep prompt bodies selectable while controls avoid accidental text selection.

`src/navigation.ts` parses compatible hash routes and purpose-safe prompt links. Prompt and settings sheets participate in browser history. `src/useAppFrame.ts` owns the content scroll position and keyboard-aware viewport. Each base route owns its filters and scroll position for the current session. Preserve the content scrolling region, independent sheet scrolling, safe-area padding, focus restoration, reduced motion, and a visible primary action when changing UI structure. Prompt and settings sheets can be dismissed with Back or Escape; direct sheet links return to their parent view.

UI changes alone must not alter prompt text or refresh its archived simulations. Validate native-style behaviors through browser interactions rather than relabeling content simulations as experience evidence.

## Copy and update consistency

Only a successful copy of the selected payload may set copied feedback. Invalidate pending UI feedback when the route, sheet, format, source, or language changes; a delayed rejection must never reopen a dismissed sheet. Allow only one clipboard write at a time, starting it during the user gesture, and retain exact selected text for manual fallback.

Suppress only the initial service-worker claim. A user-accepted update must reload exactly once on both first and returning visits. Cache versions include generated bundles and the bytes and names of precached public assets, including recovery, manifest, and icons. Recovery remains isolated from other apps and preserves local preferences.
