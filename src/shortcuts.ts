import { allPrompts } from "./prompts";
import { learningPrompts } from "./content/learning";
import { compatibleScenes } from "./scenes";
import type { PromptVariant, ReviewSource } from "./types";

export interface PracticeShortcut {
  promptId: string;
  variant: PromptVariant;
  sceneId?: string;
  pace: "coached" | "mock";
}
export type RecentPrompt =
  | ({ kind: "practice" } & PracticeShortcut)
  | { kind: "review"; promptId: string; variant: PromptVariant; source: ReviewSource }
  | { kind: "learning"; promptId: string };
type ReadStorage = Pick<Storage, "getItem"> | null;
function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function variant(value: unknown): value is PromptVariant {
  return value === "full" || value === "spoken";
}
function practice(value: unknown): PracticeShortcut | null {
  if (!object(value) || !variant(value.variant) || (value.pace !== "coached" && value.pace !== "mock")) return null;
  const prompt = allPrompts.find(p => p.id === value.promptId && p.kind !== "review");
  if (!prompt) return null;
  const scene = value.sceneId === undefined ? undefined : compatibleScenes(prompt).find(s => s.id === value.sceneId);
  if ((value.sceneId !== undefined && !scene) || (value.pace === "mock" && (prompt.id !== "roleplay-coach" || scene?.category !== "interview"))) return null;
  return { promptId: prompt.id, variant: value.variant, ...(scene ? { sceneId: scene.id } : {}), pace: value.pace };
}
function recent(value: unknown): RecentPrompt | null {
  if (!object(value)) return null;
  if (value.kind === "practice") {
    const entry = practice(value);
    return entry ? { kind: "practice", ...entry } : null;
  }
  if (value.kind === "learning" && learningPrompts.some(p => p.id === value.promptId)) return { kind: "learning", promptId: value.promptId as string };
  if (value.kind === "review" && allPrompts.some(p => p.id === value.promptId && p.kind === "review") && variant(value.variant) && (value.source === "current" || value.source === "transcript")) return { kind: "review", promptId: value.promptId as string, variant: value.variant, source: value.source };
  return null;
}
function read(storage: ReadStorage, key: string): string | null {
  try { return storage?.getItem(key) ?? null; } catch { return null; }
}
function array(raw: string | null): unknown[] {
  try { const value: unknown = JSON.parse(raw ?? "null"); return Array.isArray(value) ? value : []; } catch { return []; }
}
export function shortcutKey(shortcut: PracticeShortcut): string {
  return JSON.stringify([shortcut.promptId, shortcut.variant, shortcut.sceneId ?? null, shortcut.pace]);
}
export function practiceHref(shortcut: PracticeShortcut): string {
  const query = new URLSearchParams({ prompt: shortcut.promptId });
  if (shortcut.sceneId) query.set("scene", shortcut.sceneId);
  if (shortcut.pace === "mock") query.set("pace", "mock");
  if (shortcut.variant === "spoken") query.set("format", "spoken");
  return `#library?${query}`;
}
export function recentHref(entry: RecentPrompt): string {
  if (entry.kind === "practice") return practiceHref(entry);
  const query = new URLSearchParams({ prompt: entry.promptId });
  if (entry.kind === "review") {
    if (entry.source === "transcript") query.set("source", "transcript");
    if (entry.variant === "spoken") query.set("format", "spoken");
  }
  return `#${entry.kind}?${query}`;
}
export function readPracticeShortcuts(storage: ReadStorage): PracticeShortcut[] {
  const seen = new Set<string>();
  return array(read(storage, "talksprout:practice-shortcuts")).flatMap(value => {
    const entry = practice(value);
    if (!entry || seen.has(shortcutKey(entry))) return [];
    seen.add(shortcutKey(entry));
    return [entry];
  });
}
function recentKey(entry: RecentPrompt): string {
  return entry.kind === "practice" ? `practice:${shortcutKey(entry)}` : entry.kind === "review" ? JSON.stringify([entry.kind, entry.promptId, entry.variant, entry.source]) : `learning:${entry.promptId}`;
}
function bounded(values: unknown[]): RecentPrompt[] {
  const seen = new Set<string>();
  const counts = { practice: 0, review: 0, learning: 0 };
  return values.flatMap(value => {
    const entry = recent(value);
    if (!entry || seen.has(recentKey(entry)) || counts[entry.kind] >= 4) return [];
    seen.add(recentKey(entry)); counts[entry.kind]++;
    return [entry];
  });
}
export function recordRecent(items: RecentPrompt[], entry: RecentPrompt): RecentPrompt[] {
  return bounded([entry, ...items]);
}
export function readRecentPrompts(storage: ReadStorage): RecentPrompt[] {
  const raw = read(storage, "talksprout:recent-items");
  if (raw !== null) return bounded(array(raw));
  return bounded(array(read(storage, "talksprout:recent")).map(id => {
    const prompt = allPrompts.find(p => p.id === id);
    return prompt?.kind === "review" ? { kind: "review", promptId: prompt.id, variant: "full", source: "current" } : prompt ? { kind: "practice", promptId: prompt.id, variant: "full", pace: "coached" } : null;
  }));
}
