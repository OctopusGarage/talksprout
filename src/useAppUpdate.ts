import { useEffect, useRef, useState } from "react";
import { createAppUpdateManager, type AppUpdateSnapshot } from "./app-update";
import { getOfflineStatus, type OfflineStatus } from "./offline-readiness";
export type { OfflineStatus } from "./offline-readiness";
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
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>("unknown");
  const manager = useRef<ReturnType<typeof createAppUpdateManager> | null>(
    null,
  );
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("caches" in window)) {
      setOfflineStatus("unavailable");
      return;
    }
    if (!import.meta.env.PROD) return;
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    let checking = false;
    let offlinePoll: ReturnType<typeof setTimeout> | undefined;
    const watched = new Set<ServiceWorker>();
    const observeWorker = () => {
      const worker = registration?.installing;
      if (worker && !watched.has(worker)) {
        watched.add(worker);
        worker.addEventListener("statechange", refreshOffline);
      }
      refreshOffline();
    };
    function refreshOffline() { void checkOffline(); }
    const checkOffline = async () => {
      if (checking || !registration) return;
      checking = true;
      const status = await getOfflineStatus(caches, registration.scope, !!registration.installing);
      checking = false;
      if (disposed) return;
      setOfflineStatus(status);
      clearTimeout(offlinePoll);
      // Stop disk reads once evidence is conclusive; resume/lifecycle events recheck eviction.
      if (status === "installing" || status === "unknown")
        offlinePoll = setTimeout(refreshOffline, 2000);
    };
    const updates = createAppUpdateManager({
      container: navigator.serviceWorker,
      onChange: (next) => {
        setCompleted(false);
        setSnapshot(next);
      },
      onRegistrationError: () => setOfflineStatus("unavailable"),
      onRegistration: (reg) => {
        registration = reg;
        reg.addEventListener("updatefound", observeWorker);
        observeWorker();
      },
      reload: () => {
        try {
          sessionStorage.setItem(completionKey, String(Date.now()));
        } catch {}
        location.reload();
      },
    });
    manager.current = updates;
    const resume = () => {
      if (document.visibilityState === "visible") {
        updates.resume(navigator.onLine);
        void checkOffline();
      }
    };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("pageshow", resume);
    window.addEventListener("online", resume);
    window.addEventListener("focus", resume);
    void updates.start(`${import.meta.env.BASE_URL}sw.js`);
    return () => {
      disposed = true;
      clearTimeout(offlinePoll);
      registration?.removeEventListener("updatefound", observeWorker);
      for (const worker of watched) worker.removeEventListener("statechange", refreshOffline);
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
    offlineStatus,
    cacheUnavailable: offlineStatus === "unavailable",
    requestUpdate: () => manager.current?.request(),
  };
}
