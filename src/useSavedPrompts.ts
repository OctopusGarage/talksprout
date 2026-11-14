import { useRef, useState } from "react";
import { readSaved } from "./library";
import { learningPrompts } from "./content/learning";
import { readPracticeShortcuts, readRecentPrompts, recordRecent, shortcutKey, type PracticeShortcut, type RecentPrompt } from "./shortcuts";

export function useSavedPrompts(storage: Storage | null) {
  const [shortcuts, setShortcuts] = useState(() => readPracticeShortcuts(storage));
  const [learningFavorites, setLearningFavorites] = useState(() => readSaved(storage, "talksprout:learning-favorites").filter(id => learningPrompts.some(p => p.id === id)));
  const [recent, setRecent] = useState(() => readRecentPrompts(storage));
  const current = useRef({ shortcuts, learningFavorites, recent });
  current.current = { shortcuts, learningFavorites, recent };
  const persist = (key: string, value: unknown) => {
    try { if (!storage) return false; storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  };
  return {
    shortcuts, learningFavorites, recent,
    toggleShortcut(entry: PracticeShortcut) {
      const key = shortcutKey(entry);
      const next = current.current.shortcuts.some(item => shortcutKey(item) === key)
        ? current.current.shortcuts.filter(item => shortcutKey(item) !== key)
        : [...current.current.shortcuts, entry];
      current.current.shortcuts = next;
      setShortcuts(next);
      return persist("talksprout:practice-shortcuts", next);
    },
    toggleLearningFavorite(id: string) {
      if (!learningPrompts.some(p => p.id === id)) return false;
      const next = current.current.learningFavorites.includes(id)
        ? current.current.learningFavorites.filter(item => item !== id)
        : [...current.current.learningFavorites, id];
      current.current.learningFavorites = next;
      setLearningFavorites(next);
      return persist("talksprout:learning-favorites", next);
    },
    record(entry: RecentPrompt) {
      const next = recordRecent(current.current.recent, entry);
      current.current.recent = next;
      setRecent(next);
      return persist("talksprout:recent-items", next);
    },
  };
}
