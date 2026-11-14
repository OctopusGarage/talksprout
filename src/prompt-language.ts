import type { Locale } from "./types";

/** Render instructional defaults only. Appended scenario/background data stays verbatim. */
export function localizePromptInstructions(text: string, locale: Locale): string {
  if (locale === "zh") return text;
  const boundary = text.indexOf("SELECTED PRACTICE SCENARIO");
  const instructions = boundary < 0 ? text : text.slice(0, boundary);
  const material = boundary < 0 ? "" : text.slice(boundary);
  return instructions
    .replaceAll("Explain briefly in Chinese unless I request English", "Explain briefly in English unless I request another language")
    .replaceAll("concise Chinese for explanations", "concise English for explanations")
    .replaceAll("Chinese explanations", "English explanations")
    .replaceAll("Chinese explanation", "English explanation")
    .replaceAll("Chinese meaning cues", "plain-English meaning cues")
    .replaceAll("Chinese recall cues", "plain-English recall cues")
    .replaceAll("Chinese meanings", "plain-English meanings")
    .replaceAll("Chinese meaning", "plain-English meaning")
    .replaceAll("Chinese cues", "plain-English cues") + material;
}
