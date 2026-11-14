import { useEffect, useRef, useState } from "react";
import { createAppUpdateManager, type AppUpdateSnapshot } from "./app-update";
const completionKey = "talksprout:update-completed";
function consumeCompletion() {
  try {
    const time = Number(sessionStorage.getItem(completionKey));
    sessionStorage.removeItem(completionKey);
    return time > 0 && Date.now() - time >= 0 && Date.now() - time < 60000;
  } catch {
    return false;
  }
}
export function useAppUpdate() {
  const [snapshot, setSnapshot] = useState<AppUpdateSnapshot>({
    phase: "idle",
  });
  const [completed, setCompleted] = useState(consumeCompletion);
  const [cacheUnavailable, setCacheUnavailable] = useState(false);
  const manager = useRef<ReturnType<typeof createAppUpdateManager> | null>(
    null,
  );
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;
    const updates = createAppUpdateManager({
      container: navigator.serviceWorker,
      onChange: (next) => {
        setCompleted(false);
        setSnapshot(next);
      },
      onRegistrationError: () => setCacheUnavailable(true),
      reload: () => {
        try {
          sessionStorage.setItem(completionKey, String(Date.now()));
        } catch {}
        location.reload();
      },
    });
    manager.current = updates;
    const resume = () => {
      if (document.visibilityState === "visible")
        updates.resume(navigator.onLine);
    };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("pageshow", resume);
    window.addEventListener("online", resume);
    window.addEventListener("focus", resume);
    void updates.start(`${import.meta.env.BASE_URL}sw.js`);
    return () => {
      updates.dispose();
      manager.current = null;
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("pageshow", resume);
      window.removeEventListener("online", resume);
      window.removeEventListener("focus", resume);
    };
  }, []);
  useEffect(() => {
    if (!completed) return;
    const timer = setTimeout(() => setCompleted(false), 5000);
    return () => clearTimeout(timer);
  }, [completed]);
  return {
    snapshot,
    completed,
    cacheUnavailable,
    requestUpdate: () => manager.current?.request(),
  };
}
