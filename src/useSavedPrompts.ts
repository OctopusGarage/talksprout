import { useEffect, useRef, useState } from "react";
import { readSaved } from "./library";
import { allPrompts } from "./prompts";
import { learningPrompts } from "./content/learning";
import { readPracticeShortcuts, readRecentPrompts, recordRecent, shortcutKey, type PracticeShortcut, type RecentPrompt } from "./shortcuts";

const keys = {
  favorites: "talksprout:favorites",
  shortcuts: "talksprout:practice-shortcuts",
  learningFavorites: "talksprout:learning-favorites",
  recent: "talksprout:recent-items",
  legacyRecent: "talksprout:recent",
};
interface SavedState {
  favorites: string[];
  shortcuts: PracticeShortcut[];
  learningFavorites: string[];
  recent: RecentPrompt[];
}
function read(storage: Storage | null): SavedState {
  return {
    favorites: readSaved(storage, keys.favorites).filter(id => allPrompts.some(p => p.id === id)),
    shortcuts: readPracticeShortcuts(storage),
    learningFavorites: readSaved(storage, keys.learningFavorites).filter(id => learningPrompts.some(p => p.id === id)),
    recent: readRecentPrompts(storage),
  };
}
function membership<T>(items: T[], item: T, selected: boolean, equal: (value: T) => boolean): T[] {
  return selected ? items.some(equal) ? items : [...items, item] : items.filter(value => !equal(value));
}

export function useSavedPrompts(storage: Storage | null) {
  const [state, setState] = useState(() => read(storage));
  // Store requested per-item operations, never an old full-array snapshot.
  const pending = useRef<{ key: keyof SavedState; apply: (state: SavedState) => SavedState }[]>([]);
  const reconcile = (latest: SavedState) => pending.current.reduce((next, intent) => intent.apply(next), latest);
  const current = useRef(state);
  current.current = state;
  const publish = (next: SavedState) => { current.current = next; setState(next); };
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if ((!event.storageArea || event.storageArea === storage) && (event.key === null || Object.values(keys).includes(event.key))) {
        if (event.key === null) pending.current = [];
        const next = reconcile(read(storage));
        current.current = next;
        setState(next);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [storage]);
  const mutate = async <K extends keyof SavedState>(key: K, storageKey: string, update: (latest: SavedState[K]) => SavedState[K]): Promise<boolean> => {
    const intent = { key, apply: (latest: SavedState): SavedState => ({ ...latest, [key]: update(latest[key]) }) };
    let entered = false;
    const write = () => {
      entered = true;
      let latest = current.current;
      try {
        if (storage) { storage.getItem(storageKey); latest = read(storage); }
      } catch { /* Keep this window usable when storage access is blocked. */ }
      const next = intent.apply(reconcile(latest));
      publish(next);
      try {
        if (!storage) { pending.current.push(intent); return false; }
        storage.setItem(storageKey, JSON.stringify(next[key]));
        pending.current = pending.current.filter(item => item.key !== key);
        return true;
      } catch { pending.current.push(intent); return false; }
    };
    // Serialize read-modify-write across same-origin app windows where supported.
    if (navigator.locks) {
      try { return await navigator.locks.request("talksprout:saved-state", write); }
      catch { return entered ? false : write(); }
    }
    return write();
  };
  return {
    ...state,
    toggleFavorite(id: string) {
      if (!allPrompts.some(p => p.id === id)) return Promise.resolve(false);
      const selected = !current.current.favorites.includes(id);
      return mutate("favorites", keys.favorites, latest => membership(latest, id, selected, item => item === id));
    },
    toggleShortcut(entry: PracticeShortcut) {
      const key = shortcutKey(entry);
      const selected = !current.current.shortcuts.some(item => shortcutKey(item) === key);
      return mutate("shortcuts", keys.shortcuts, latest => membership(latest, entry, selected, item => shortcutKey(item) === key));
    },
    toggleLearningFavorite(id: string) {
      if (!learningPrompts.some(p => p.id === id)) return Promise.resolve(false);
      const selected = !current.current.learningFavorites.includes(id);
      return mutate("learningFavorites", keys.learningFavorites, latest => membership(latest, id, selected, item => item === id));
    },
    record(entry: RecentPrompt) {
      return mutate("recent", keys.recent, latest => recordRecent(latest, entry));
    },
  };
}
