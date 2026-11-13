import { categoryNames } from "./types";
import { companions } from "./content/companions";
import { interaction } from "./content/interaction";
import { materials } from "./content/materials";
import { reviewPrompts } from "./content/review";
import type { ConversationPrompt, Prompt } from "./types";
export const categories = categoryNames;
export const prompts: ConversationPrompt[] = [
  ...companions,
  ...interaction,
  ...materials,
];
export { reviewPrompts };
export const allPrompts: Prompt[] = [...prompts, ...reviewPrompts];
