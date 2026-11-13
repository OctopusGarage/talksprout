import type { Prompt } from "./types";
export interface Filters {
  query?: string;
  category?: string;
  favoritesOnly?: boolean;
  favorites?: string[];
  level?: string;
  mode?: string;
  preparation?: string;
}
export function filterPrompts(
  prompts: Prompt[],
  {
    query = "",
    category = "全部练习",
    favoritesOnly = false,
    favorites = [],
    level = "all",
    mode = "all",
    preparation = "all",
  }: Filters = {},
) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const levels = ["A1", "A2", "B1", "B2"];
  return prompts.filter((p) => {
    const [lo, hi] =
      p.kind === "review"
        ? [-1, -1]
        : p.level.split("–").map((l) => levels.indexOf(l));
    const haystack = [
      p.title,
      p.english,
      p.description,
      p.descriptionEn,
      p.category,
      p.kind === "review" ? "" : p.level,
      p.feedback,
      p.feedbackEn,
      p.guide,
      p.guideEn,
      ...p.tags,
    ]
      .join(" ")
      .toLocaleLowerCase();
    return (
      (category === "全部练习" || p.category === category) &&
      (!favoritesOnly || favorites.includes(p.id)) &&
      terms.every((q) => haystack.includes(q)) &&
      (level === "all" ||
        (levels.indexOf(level) >= lo && levels.indexOf(level) <= hi)) &&
      (mode === "all" || p.mode === "both" || p.mode === mode) &&
      (preparation === "all" ||
        p.needsMaterial === (preparation === "material"))
    );
  });
}
export function readSaved(
  storage: Pick<Storage, "getItem"> | null,
  key: string,
): string[] {
  try {
    const value: unknown = JSON.parse(storage?.getItem(key) ?? "null");
    return Array.isArray(value)
      ? [...new Set(value.filter((v): v is string => typeof v === "string"))]
      : [];
  } catch {
    return [];
  }
}
export function writeSaved(
  storage: Pick<Storage, "setItem"> | null,
  key: string,
  value: string[],
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
