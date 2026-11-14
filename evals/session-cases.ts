import { createHash } from 'node:crypto';
import { prompts, reviewPrompts } from '../src/prompts';
import { learningPrompts } from '../src/content/learning';
import { promptText, learningPromptText } from '../src/prompt-text';
import { createLearningLiveCases } from './learning-live-cases';
import { createLiveCases, type LiveCase } from './live-cases';
const hash = (text: string) => createHash('sha256').update(text).digest('hex');

export function createEnglishCases(): LiveCase[] {
  const material = createLearningLiveCases().filter(c => c.purpose === 'learning-material');
  const spokenContexts = createLiveCases().filter(c => c.variant === 'spoken' && ['review-current', 'review-missing', 'voice-only-text-fallback'].includes(c.purpose));
  return [
    ...spokenContexts.map(c => {
      const p = reviewPrompts.find(p => p.id === c.promptId)!;
      const payload = promptText(p, 'spoken', 'current', 'en');
      return { ...c, id: `english-${c.id}`, locale: 'en' as const,
        purpose: `english-spoken-seeded-text-${c.purpose}`, payloadSha256: hash(payload),
        messages: [...c.messages.slice(0, -1), { role: 'user' as const, content: payload }],
        criterion: `${c.criterion} ${c.promptId === "vocabulary-ipa-review" ? "For written vocabulary output, every selected headword/phrase must occur in earlier learner practice, never only in the review request. Merge go hiking and went hiking as inflections of the same item; do not pad to ten. " : ""}Use English explanations and meaning cues. Missing learner practice must not turn review instructions into source. If writing is available (the ordinary current context), produce the requested written material, not the oral-only fallback. Numbered recall questions require corresponding answers with matching numbers; copying dialogue lines is not a matching answer key. A compact card may test any genuine learning point in the supplied hiking exchange, including enjoyed the quiet forest, not only the corrected went. This is single-turn real target/judge text execution over authored seeded context, not an end-to-end session or actual audio. Do not claim to hear, play, or assess audio. Apply only the compact prompt's constraints, not requirements from the full variant.` };
    }),
    ...material.map(c => {
      const p = learningPrompts.find(p => p.id === c.promptId)!;
      const payload = learningPromptText(p, 'en');
      return { ...c, id: `english-${c.id}`, locale: 'en' as const, payloadSha256: hash(payload),
        messages: [{ role: 'user' as const, content: payload }, ...c.messages.slice(1)],
        criterion: `${c.criterion} Check all prompt constraints, not just topical relevance. Additional useful source phrases such as make sure are allowed; the criterion does not require idioms exclusively. For listening-check, request readiness and WAIT: do not ask a comprehension question in the same first reply. Shadowing pronunciation hints must preserve past-tense sounds; do not equate wanted to with want to/wanna. Explain in English, including meaning cues; preserve original Chinese learner material and translate its intent where requested.` };
    }),
    ...reviewPrompts.map(p => {
      const payload = promptText(p, 'full', 'transcript', 'en');
      return { id: `english-review-${p.id}`, promptId: p.id, variant: 'full' as const, source: 'transcript' as const,
        locale: 'en' as const, purpose: 'english-source-review', payloadSha256: hash(payload), maxTokens: 2200,
        criterion: 'Explain in English, including meaning cues. Cards must have distinct semantic learning targets, not two prompts with the same answer sentence. A Chinese source utterance needing translation is not automatically a grammatical error. Ground all claims in the pasted transcript, preserve speaker attribution and uncertainty. The learner said went, not goed; do not manufacture that error. Do not invent pronunciation evidence or restart coaching.',
        messages: [{ role: 'user' as const, content: payload.replace('[Paste the conversation here, including speaker labels]', 'Coach: What happened at work?\nLearner: I went to the planning meeting. 周五可能完成，但不能保证。\nCoach: You could say: We might finish by Friday, but I cannot promise yet.\nLearner: We might finish by Friday, but I cannot promise yet.') }] };
    }),
  ];
}

// Authored learner scripts are held out from the existing seeded follow-up probes.
// No assistant histories: live.py appends the actual target reply before each next input.
export function createSessionCases(): LiveCase[] {
  const specs = [
    { id: 'gentle-start', inputs: ['Could we talk about the tiny balcony garden I started?', 'I planted mint, but it keep dying.', 'Could you give me a tiny hint? I am stuck.', 'That is enough for today; please end here.'] },
    { id: 'focused-correction', inputs: ['Practice a short conversation about borrowing a bike.', 'Yesterday I borrow my neighbor bike.', 'Let me retry: Yesterday I borrowed my neighbor’s bike.', 'Please stop now.'] },
    { id: 'roleplay-coach', inputs: ['Role-play returning a cracked teapot. You are the shop assistant.', 'I bought this yesterday and the handle is cracked.', 'I cannot find the words. Give me one short phrase to request a replacement.', 'I want to end this practice now.'] },
    { id: 'expression-upgrade', inputs: ['Help me discuss a project delay without sounding certain about Friday.', 'We maybe finish Friday, but not promise.', 'Retry: We might finish by Friday, but I cannot promise yet.', 'End our practice here.'] },
    { id: 'writing-summary', inputs: ['Source: Nine residents tried a new bus route. Six liked it, three did not. No travel times were measured. My summary: Everyone loved the faster route.', 'Help me understand what I got wrong without inventing data.', 'Retry: Six of nine residents liked the new bus route; travel times were not measured.', 'Stop now, please.'] },
    { id: 'reading-technical', inputs: ['Excerpt: Cached entries expire after 90 seconds unless refresh_on_read is enabled. Explain this condition; do not execute anything.', 'So every read always renews it?', 'I am stuck. Give one example assuming refresh_on_read is disabled.', 'Please end the exercise.'] },
    { id: 'sentence-correction-review', inputs: ['Please review only this source: Tutor: I goed yesterday is an example of an error. Learner: I went yesterday. Tutor: What might happen Friday? Learner: We may finish, but it is not certain.', 'Was “goed” my mistake? Check the speaker labels.', 'Explain the uncertainty phrase with one grounded example, please.', 'Stop; no further exercises.'] },
    { id: 'review-cards', inputs: ['Only use this practice record: Learner: I have lived here for two years. Coach: That is natural. Learner: I might move next spring, but it is undecided. Make a short review.', 'Do not mark “have lived” as wrong. I still live here.', 'Help me review “might” without turning the possible move into a plan.', 'Stop here.'] },
  ];
  return specs.map(spec => {
    const learning = learningPrompts.find(p => p.id === spec.id);
    const p = [...prompts, ...reviewPrompts].find(p => p.id === spec.id);
    const payload = learning ? learningPromptText(learning, 'en') : promptText(p!, 'full', 'current', 'en');
    const review = reviewPrompts.some(p => p.id === spec.id);
    return { id: `session-heldout-${spec.id}`, promptId: spec.id, locale: 'en', variant: 'full', source: 'current',
      purpose: review ? 'heldout-source-review' : 'heldout-session', payloadSha256: hash(payload), maxTokens: 1800,
      criterion: 'Assess EVERY reply against its own turn criterion, original prompt, and actual accumulated conversation. Fail if ANY earlier reply violates a constraint even when the final stop is correct. Apply constraints only to their matching task: check roleplay replies for multiple questions and review cards for duplicate targets WITHIN ONE REPLY, not repeated practice across turns. Answer choices and declarative sample answers are not questions. Clearly labeled tutor examples are not attribution errors. Do not assume an authored assistant answer.',
      messages: [{ role: 'user', content: payload }],
      turns: spec.inputs.map((input, index) => ({ input,
        criterion: index === 3 ? 'Honor stopping immediately, no new task/question or fabricated progress.' :
          `Address the current learner request in context and explain in English. ${!learning && !review ? "Ask at most one question per reply, including in-character and out-of-character questions together. Declarative answer choices do not count as questions." : ""} ${spec.id === "review-cards" ? "Within each reply, review cards must not repeat the same semantic answer target. Repeating a target on a later explicitly requested review is allowed." : ""} Preserve supplied source, speaker attribution and uncertainty; never invent errors, audio access, results or facts. ${review ? 'Review only the supplied practice source and actual subsequent conversation; distinguish coach examples from learner errors.' : 'Help or retry should continue the current task without shaming or restarting setup.'}` })),
    };
  });
}
