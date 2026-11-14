import { useEffect, useRef, useState } from "react";
import { createAppUpdateManager, type AppUpdateSnapshot } from "./app-update";
import { getOfflineStatus, type OfflineStatus } from "./offline-readiness";
import { createOfflineCheck } from "./offline-check";
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
    const offlineCheck = createOfflineCheck({
      read: () => getOfflineStatus(caches, registration!.scope, !!registration!.installing),
      publish: setOfflineStatus,
      visible: () => !!registration && document.visibilityState === "visible",
      schedule: (callback, delay) => setTimeout(callback, delay),
      cancel: clearTimeout,
    });
    const watched = new Set<ServiceWorker>();
    const observeWorker = () => {
      const worker = registration?.installing;
      if (worker && !watched.has(worker)) {
        watched.add(worker);
        worker.addEventListener("statechange", refreshOffline);
      }
      refreshOffline();
    };
    function refreshOffline() { offlineCheck.restart(); }
    const updates = createAppUpdateManager({
      container: navigator.serviceWorker,
      onChange: (next) => {
        setCompleted(false);
        setSnapshot(next);
      },
      onRegistrationError: () => {
        offlineCheck.suspend();
        if (!disposed) setOfflineStatus("unavailable");
      },
      onRegistration: (reg) => {
        if (disposed) return;
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
        offlineCheck.resume();
      } else offlineCheck.suspend();
    };
    const reconnect = () => { offlineCheck.restart(); resume(); };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("pageshow", resume);
    window.addEventListener("online", reconnect);
    window.addEventListener("focus", resume);
    void updates.start(`${import.meta.env.BASE_URL}sw.js`);
    return () => {
      disposed = true;
      offlineCheck.dispose();
      registration?.removeEventListener("updatefound", observeWorker);
      for (const worker of watched) worker.removeEventListener("statechange", refreshOffline);
      updates.dispose();
      manager.current = null;
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("pageshow", resume);
      window.removeEventListener("online", reconnect);
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
