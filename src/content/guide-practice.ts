import { allPrompts } from "../prompts";
import { learningPrompts } from "./learning";
import type { GuidePractice } from "./guide-types";

export function practiceLinks(ids: string[]): GuidePractice[] {
  return ids.map(promptId => {
    const coach = allPrompts.find(prompt => prompt.id === promptId);
    if (coach) return { promptId, label: { zh: coach.title, en: coach.english } };
    const helper = learningPrompts.find(prompt => prompt.id === promptId);
    if (helper) return { promptId, label: helper.title };
    throw new Error(`Unknown guide practice: ${promptId}`);
  });
}
