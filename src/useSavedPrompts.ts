import { useEffect, useRef, useState } from "react";
import { createSavedSnapshot } from "./saved-snapshot";
import { readSaved } from "./library";
import { allPrompts } from "./prompts";
import { learningPrompts } from "./content/learning";
import { readPracticeShortcuts, readRecentPrompts, recordRecent, shortcutKey, type PracticeShortcut, type RecentPrompt } from "./shortcuts";

const signalKey = "talksprout:saved-updated";
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
function read(storage: Pick<Storage, "getItem"> | null): SavedState {
  return {
    favorites: readSaved(storage, keys.favorites).filter(id => allPrompts.some(p => p.id === id)),
    shortcuts: readPracticeShortcuts(storage),
    learningFavorites: readSaved(storage, keys.learningFavorites).filter(id => learningPrompts.some(p => p.id === id)),
    recent: readRecentPrompts(storage),
  };
}
let snapshot: ReturnType<typeof createSavedSnapshot> | undefined;
try { if (globalThis.indexedDB) snapshot = createSavedSnapshot(globalThis.indexedDB); } catch {}
function decode(raw: unknown): SavedState {
  const value = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const fields: Record<string, unknown> = {
    [keys.favorites]: value.favorites,
    [keys.shortcuts]: value.shortcuts,
    [keys.learningFavorites]: value.learningFavorites,
    [keys.recent]: value.recent,
  };
  return read({ getItem: key => fields[key] === undefined ? null : JSON.stringify(fields[key]) });
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
  const version = useRef(0);
  const mounted = useRef(true);
  const channel = useRef<BroadcastChannel | null>(null);
  const refreshSaved = useRef<() => void>(() => {});
  const publish = (next: SavedState) => {
    version.current++;
    current.current = next;
    if (mounted.current) setState(next);
  };
  useEffect(() => {
    mounted.current = true;
    const refresh = async () => {
      const request = ++version.current;
      let latest = read(storage);
      if (snapshot) {
        try {
          const raw = await snapshot.read();
          if (raw !== undefined) latest = decode(raw);
        } catch { /* Keep validated legacy/session data when native storage is unavailable. */ }
      }
      if (mounted.current && request === version.current) publish(reconcile(latest));
    };
    refreshSaved.current = () => { void refresh(); };
    try {
      channel.current = new BroadcastChannel("talksprout:saved");
      channel.current.onmessage = () => { void refresh(); };
    } catch { channel.current = null; }
    const foreground = () => { if (document.visibilityState === "visible") void refresh(); };
    const sync = (event: StorageEvent) => {
      if ((event.storageArea && event.storageArea !== storage) || (event.key !== null && event.key !== signalKey && !Object.values(keys).includes(event.key))) return;
      if (event.key === null) {
        pending.current = [];
        version.current++;
        if (snapshot) {
          void snapshot.update(() => read(storage), () => {}).then(() => refresh(), () => refresh());
          return;
        }
      }
      void refresh();
    };
    window.addEventListener("storage", sync);
    window.addEventListener("focus", foreground);
    document.addEventListener("visibilitychange", foreground);
    void refresh();
    return () => {
      mounted.current = false;
      version.current++;
      refreshSaved.current = () => {};
      channel.current?.close();
      channel.current = null;
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", foreground);
      document.removeEventListener("visibilitychange", foreground);
    };
  }, [storage]);
  const mutate = async <K extends keyof SavedState>(key: K, storageKey: string, update: (latest: SavedState[K]) => SavedState[K]): Promise<boolean> => {
    const intent = { key, apply: (latest: SavedState): SavedState => ({ ...latest, [key]: update(latest[key]) }) };
    if (snapshot) {
      let attempted: SavedState | undefined;
      try {
        const next = await snapshot.update(raw => {
          attempted = intent.apply(reconcile(raw === undefined ? read(storage) : decode(raw)));
          return attempted;
        }, next => {
          if (!storage) throw new Error("Local preferences unavailable");
          // Compatibility mirrors are not the transaction's source of truth.
          for (const field of ["favorites", "shortcuts", "learningFavorites", "recent"] as const)
            storage.setItem(keys[field], JSON.stringify(next[field]));
        });
        pending.current = [];
        publish(next);
        // Mirrors may already contain these bytes after an aborted attempt.
        // Notify only after native commit, even when no storage event is emitted.
        try {
          if (channel.current) channel.current.postMessage("changed");
          else storage?.setItem(signalKey, `${Date.now()}-${Math.random()}`);
        } catch { /* Foreground refresh still reconciles committed data. */ }
        refreshSaved.current();
        return true;
      } catch {
        pending.current.push(intent);
        publish(attempted ?? intent.apply(current.current));
        return false;
      }
    }
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
    // Legacy-only fallback; native transactions above provide cross-window atomicity.
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
