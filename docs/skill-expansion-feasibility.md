# Listening, reading, and writing expansion feasibility

Research date: 2026-11-14. Status: decision support, not an implementation plan or a validated learning-effectiveness claim.

See [supporting research evidence](listening-reading-writing-evidence.md) for listening-process research and additional writing-feedback findings.

## Conclusion

TalkSprout can add meaningful reading and writing practice while remaining a prompt-first static app. Listening can be supported as a guided workflow around external recordings, but reliable audio playback, transcript concealment, replay, and audio-grounded diagnosis are outside the current app's control. A balanced learning experience does not require turning this app into an integrated AI platform.

Recommended sequence: short task-based writing, source-grounded reading, then externally sourced listening with explicit prerequisites. This ordering is a product judgment based on controllability and reuse, not measured demand or demonstrated learning gains.

## Repository evidence

- `README.md`: nine conversation coaches, four reviews, 160 scenario presets; prompts are copied to an external AI; no in-app AI chat or conversation storage.
- `src/content/materials.ts`: `story-summary` accepts a text or learner account, then primarily coaches retelling language. It cannot check source comprehension without the source.
- `src/content/companions.ts`: wording feedback and retries already exist, but expression coaching explicitly avoids long editing tasks.
- `src/content/review.ts`: study notes, corrections, vocabulary and cards support subsequent study; receiving generated notes is not itself learner writing practice.
- `src/types.ts`: `mode` represents voice/text delivery, not learning skill. Conversation and review are the existing task types; all prompt content requires a spoken form.
- `src/scenes.ts`: existing scenario composition supplies conversation-oriented roles and openings. Topics can be reused conceptually, but their payloads cannot be assumed appropriate for reading passages or writing briefs.
- `docs/content-guide.md`: explicitly limits practice to ongoing conversation and excludes general document analysis and batch rewriting. Genuine expansion requires a deliberate scope update.
- `docs/evals.md`: recorded text execution does not establish audio compatibility, proficiency measurement, or learning effectiveness. Existing evidence does not validate new workflows.

These are static repository observations. No model calls, audio tests, browser tests, or learner studies were performed for this analysis.

## Pedagogical anchors

The [Council of Europe](https://www.coe.int/en/web/portfolio/the-common-european-framework-of-reference-for-languages-learning-teaching-assessment-cefr-) distinguishes reception, production, interaction and mediation, including spoken and written forms. This supports describing observable tasks rather than treating a voice/text toggle as skill coverage.

[Nation's Four Strands](https://www.wgtn.ac.nz/lals/resources/paul-nations-resources/paul-nations-publications/publications/documents/2007-Four-strands.pdf) distinguishes meaning-focused input, meaning-focused output, language-focused learning and fluency development. This is a curriculum framework, not evidence that four app tabs or equal counts of prompts yield balanced learning. The product inference is to include actual comprehension, composition and reuse rather than only correction.

The British Council's [B1 reading lessons](https://learnenglish.britishcouncil.org/free-resources/reading/b1) combine source texts with comprehension activities, including everyday and workplace genres. Its [listening lesson](https://learnenglish.britishcouncil.org/free-resources/listening/a2/instructions-assignment?page=1) provides a recording, transcript and exercises. These are examples of established task design, not controlled evidence that the proposed AI workflows work.

[Cambridge's B1 writing checklist](https://www.cambridgeenglish.org/Images/652769-b1-preliminary-for-schools-writing-checklist-for-teachers.pdf) separates content, communicative achievement, organisation and language. A writing coach should therefore evaluate audience and purpose as well as grammatical wording. These criteria do not authorize AI-generated exam scores.

The empirical boundary matters: [Endley and Karim (2022)](https://files.eric.ed.gov/fulltext/EJ1361367.pdf) studied 26 intermediate university learners over six weeks with focused written feedback on selected structures. Revision helped the revised writing, but the feedback-plus-revision group did not show comparable posttest improvement; the authors did not interpret the findings as strong evidence of L2 knowledge development. This small, specific, non-AI study does not settle overall feedback effectiveness. It does show why a better second draft cannot establish durable learning or validate an AI writing coach.

There is also positive transfer evidence: the [university repository abstract for Van Beuningen et al. (2012)](https://dare.uva.nl/id/d195ffca-61d9-4ee7-b36a-32130f65c885) reports gains in accuracy on new texts as well as revisions with 268 L2 learners. Together these studies argue for measuring transfer explicitly, rather than assuming either that feedback always transfers or that it never does. Neither study evaluates AI coaching.

## Candidate workflows

| Skill | Proposed learner activity | Minimum source or capability | What counts as useful feedback | Main limitation |
| --- | --- | --- | --- | --- |
| Writing | Understand audience and goal; draft a message; receive limited feedback; revise; later write a comparable new message | Text chat; optional learner draft | Missing information, unsuitable tone, organisation and real language errors; preserve intended meaning | Polished AI rewrites can replace practice; revision quality does not prove transfer |
| Reading | Read a short passage; answer a gist question; locate evidence for details or inference; revisit a misunderstanding | Actual passage available to AI and learner | Compare comprehension against specific source evidence, separately from response grammar | Guessable questions and immediate summaries can bypass reading; inferred answers may be ambiguous |
| Listening | Listen externally without reading; report gist; replay for details; reveal transcript; check uncertain sections; listen again | Replayable recording and trustworthy matching transcript | Compare interpretation with transcript; distinguish content errors from answer-language errors | Without audio access the AI cannot diagnose sound reduction, accent, timing or what the learner heard |

Writing examples: a scheduling request, service complaint, workplace status update, or short explanation of a technical decision. Start with a complete short artifact; do not force conversation's sentence-by-sentence feedback onto a coherent paragraph. Give planning help when requested; reserve full model answers for an appropriate stage.

Reading examples: an email requiring action, a cancellation notice, a short technical explanation. Allow Chinese or brief answers when isolating comprehension; assess English output separately. Use generated passages for low-friction exercises only when clearly labeled synthetic and checked for internal consistency; do not portray them as authentic news or validated CEFR material. Guided reading does not replace extensive reading.

Listening has three distinct approaches:

1. **External recording plus transcript:** best initial fit. Learner controls playback elsewhere and supplies the transcript to the external AI. A user can keep the AI's transcript out of view, but TalkSprout cannot enforce concealment in another app. An AI that sees only a transcript is a text-grounded comprehension coach, not an audio analyst.
2. **External AI voice session:** potentially convenient for short messages and instructions. Identical replay, transcript visibility, voice controls and instruction adherence require actual provider/device verification. Regenerating similar speech is not replaying the same recording.
3. **In-app player or AI audio integration:** offers more control but changes the product boundary. A local-file player can remain static and needs neither accounts nor an AI API. TTS/ASR integration adds service cost and privacy decisions; transcription is not pronunciation assessment. Content selection, transcript quality and browser/device checks remain necessary in either case.

## Product options and tradeoffs

| Option | Advantages | Costs and risks | Assessment |
| --- | --- | --- | --- |
| Add prompt workflows only | Preserves deployment, offline prompt access and external-AI choice | App cannot observe practice completion or guarantee media behavior | Recommended first step |
| Add material preparation and a local audio player | Better replay and transcript-reveal control | Materials handling, state, accessibility and device testing; external-chat switching remains | Consider after listening workflow usage is established |
| Build integrated AI lessons | Can coordinate source, task state, answers and feedback | Provider dependence, operational cost, storage/privacy decisions, larger evaluation surface | Not justified by current evidence alone |

Engineering effort is only relatively estimated; no time or budget estimate is defensible without selected scope. Prompt-only work is low relative to integrated audio, but still includes UI semantics, bilingual guidance, source handling and evaluations.

## Content and architecture implications

- Preserve existing coach IDs and user favorites. Keep existing conversation workflows intact.
- Model learning goals separately from interaction channel. A task can span skills; a listening task can accept a typed answer.
- Represent required materials and external capabilities explicitly. Do not offer a spoken-start shortcut indiscriminately for writing tasks.
- Separate comprehension checks, writing revision and conversation loops; reuse genuine safety/grounding rules rather than forcing all tasks into conversation constraints.
- Treat source text as material, not executable instructions. If AI cannot access a link or recording, request usable material instead of inventing access.
- Existing review prompts are conversation-specific. Reading source text, AI-generated examples and learner drafts need distinct attribution in future review workflows.
- Keep prompt bodies in English and provide Chinese/English UI guidance; preserve language selection. Do not introduce mandatory material uploads to TalkSprout merely to copy a prompt.

## Validation before making claims

1. Static review: sources are required when checking comprehension; generated passages are labeled; no hidden assumption of URL/audio access; answer keys do not precede attempts; existing IDs remain stable.
2. Authored simulations: include missing materials, ambiguous questions, correct answers, help/stop, source instructions, conflicting source information, writing with intentional style, and no forced corrections. Label these as authored examples.
3. Real text execution: test new reading/writing workflows independently; archive exact prompts and outputs. Test delayed feedback and answer leakage across turns. Do not reuse existing conversation results as evidence.
4. Real audio/device checks: if claiming listening support for a particular external service, exercise its actual voice path, replay behavior, transcript visibility and device UX. Browser tests of TalkSprout cannot establish external-provider audio behavior.
5. Learner pilot: measure independent first attempts, hint usage, successful self-revision and comparable unseen tasks. Reduced errors on the same revised draft is weaker evidence than performance on a new task. Collect completion and switching friction before assuming demand.
6. Any implementation must run the repository release checks and refresh affected prompt archives. This documentation-only research does not require pretending that release tests validate the proposals.

## Unresolved decisions

Audience level, preferred external AI services, availability of learner materials, and tolerance for switching apps are unknown. These can change sequencing: a strongly listening-focused audience with good recordings may justify listening first. No market-demand study, willingness-to-pay study, broad provider compatibility survey, or efficacy experiment has been completed.
