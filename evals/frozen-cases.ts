import { createHash } from 'node:crypto';
import { prompts, reviewPrompts } from '../src/prompts';
import { learningPrompts } from '../src/content/learning';
import { promptText, learningPromptText } from '../src/prompt-text';
import type { LiveCase } from './live-cases';

// Frozen before first execution. Agent-authored learner scripts, not blind validation.
export function createFrozenCases(): LiveCase[] {
  const specs = [
    { promptId: 'roleplay-coach', inputs: ['You are a museum clerk. I want to exchange my ticket for a later entry time.', 'My train arrives at noon, so I need the two o’clock slot.', 'I am unsure how to ask whether there is an extra charge. Give me a short phrase.', 'End this practice now.'] },
    { promptId: 'review-cards', inputs: ['Review only this practice: Learner: I used to collect stamps. Coach: That describes a past habit. Learner: I have already mailed the parcel. Coach: That action is completed. Make cards with different learning targets.', 'Explain the difference between the two time meanings without calling either sentence wrong.', 'Please keep the card answers separate from the questions.', 'Stop here, without a new exercise.'] },
    { promptId: 'listening-check', inputs: ['Use this supplied text for a text-only listening check: The library closes at six on Tuesday, but at eight on Thursday. Please wait until I say I am ready before asking comprehension questions.', 'I am ready for the first question.', 'I think Thursday is the later closing day.', 'Please stop the check now.'] },
    { suffix: '-fresh-detail', promptId: 'listening-check', inputs: ['Please use this text-only source for a comprehension check: A neighborhood kitchen serves soup on Wednesday. On Saturday it serves rice, and visitors must bring a container. Wait for my readiness before testing me.', 'I have read it and I am ready.', 'The main idea is the kitchen schedule and what visitors need to bring.', 'End the activity now.'] },
    { suffix: '-fresh-help', promptId: 'listening-check', inputs: ['Use this text-only source for a comprehension check: The volunteer center moved its morning briefing from the main hall to the courtyard because the hall is being painted. Wait for my readiness before questions.', 'I am ready to answer a question about it.', 'I am stuck. Give me only a small clue, not the answer or source wording.', 'Stop the exercise now.'] },
    // Reviewer-authored after stable hint/main-idea remediation; first execution only.
    { suffix: '-fresh-station', promptId: 'listening-check', inputs: ['Transcript only; you cannot access the audio. I can play the recording myself. Station announcement: The 9:20 train to Riverton will leave from platform seven instead of platform three. Passengers with bicycles must use the rear carriage. Help me check my listening comprehension.', 'I have listened and am ready.', "I'm stuck on your question. Please give me one small clue without telling me the answer or quoting the relevant source wording.", 'Please stop the exercise now.'] },
    { promptId: 'listening-shadowing', inputs: ['Use this sentence: Last autumn I wanted to visit the lighthouse, but the ferry was cancelled.', 'Explain how to connect “wanted to” while keeping the past tense. Do not change it into “want to”.', 'Give me one slower written chunk to practise; you cannot hear my voice in this chat.', 'End practice now.'] },
  ];
  return specs.map(spec => {
    const helper = learningPrompts.find(p => p.id === spec.promptId);
    const coach = [...prompts, ...reviewPrompts].find(p => p.id === spec.promptId);
    if (!helper && !coach) throw new Error(`Unknown frozen prompt ${spec.promptId}`);
    const payload = helper ? learningPromptText(helper, 'en') : promptText(coach!, 'full', 'current', 'en');
    return { id: `frozen-verification-${spec.promptId}${"suffix" in spec ? spec.suffix : ""}`, promptId: spec.promptId, locale: 'en', variant: 'full', source: 'current', purpose: 'frozen-authored-verification', maxTokens: 1800,
      payloadSha256: createHash('sha256').update(payload).digest('hex'), messages: [{role:'user',content:payload}],
      criterion: 'Judge each reply against the original prompt and actual history. One sample of an agent-authored frozen script, not blind independent validation.',
      turns: spec.inputs.map((input, index) => ({input, criterion: index === 3 ? 'Honor stopping: no new exercise, question, or fabricated progress.' : `Follow the current request and original prompt using the actual conversation. Explain in English. Never claim actual audio access. ${spec.promptId === 'roleplay-coach' ? 'At most one question total across in-character and coaching text.' : spec.promptId === 'review-cards' ? 'Different cards in the same reply must have distinct semantic targets, not paraphrases with the same answer; preserve source and tense.' : spec.promptId === 'listening-check' ? 'Before readiness, withhold all comprehension questions and answers. The first comprehension question must ask for the main idea, not a specific source detail. After readiness ask at most one question, withhold its answer until the learner attempts it. Compare each answer with the actual pending question; a true but off-target statement is not a correct answer to that question. On generic help, give a clue without answer-bearing quotes, facts, translations or paraphrases and ask no question.' : 'Pronunciation and connected-speech guidance must preserve past tense; wanted to is not want to or wanna.'}`})) };
  });
}
