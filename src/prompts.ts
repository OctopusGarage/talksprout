import { categoryNames } from "./types";
import { companions } from "./content/companions";
import { socialPrompts } from "./content/social";
import { interaction } from "./content/interaction";
import { training } from "./content/training";
import { materials } from "./content/materials";
import { reviewPrompts } from "./content/review";
import type { ConversationPrompt, Prompt } from "./types";
export const categories = categoryNames;
export const prompts: ConversationPrompt[] = [
  ...companions,
  ...socialPrompts,
  ...interaction,
  ...training,
  ...materials,
];
export { reviewPrompts };
export const allPrompts: Prompt[] = [...prompts, ...reviewPrompts];
