export type AppUpdatePhase =
  | "idle"
  | "available"
  | "applying"
  | "stalled"
  | "error"
  | "reloading";
export interface AppUpdateSnapshot {
  phase: AppUpdatePhase;
}
interface UpdateOptions {
  container: ServiceWorkerContainer;
  onChange: (snapshot: AppUpdateSnapshot) => void;
  reload: () => void;
  onRegistrationError: () => void;
  onRegistration?: (registration: ServiceWorkerRegistration) => void;
}

/** Owns update activation independently of React and the clipboard/toast state. */
export function createAppUpdateManager({
  container,
  onChange,
  reload,
  onRegistrationError,
  onRegistration,
}: UpdateOptions) {
  let registration: ServiceWorkerRegistration | undefined;
  let offered: ServiceWorker | null = null;
  let target: ServiceWorker | null = null;
  let knownController = container.controller;
  let requested = false;
  let refreshing = false;
  let disposed = false;
  let phase: AppUpdatePhase = "idle";
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let poll: ReturnType<typeof setInterval> | undefined;
  const watched = new Set<ServiceWorker>();
  const publish = (next: AppUpdatePhase) => {
    if (disposed || phase === next) return;
    phase = next;
    onChange({ phase });
  };
  const clearWait = () => {
    clearTimeout(timeout);
    clearInterval(poll);
    timeout = undefined;
    poll = undefined;
  };
  const reloadOnce = () => {
    if (disposed || refreshing) return;
    refreshing = true;
    clearWait();
    publish("reloading");
    reload();
  };
  const fail = () => {
    requested = false;
    clearWait();
    publish("error");
  };
  const watch = (worker: ServiceWorker | null) => {
    if (!worker || watched.has(worker)) return;
    watched.add(worker);
    worker.addEventListener("statechange", sync);
  };
  function sync() {
    if (disposed || !registration || refreshing) return;
    watch(registration.installing);
    watch(registration.waiting);
    watch(target);
    if (requested && target) {
      if (target.state === "activated" && registration.active === target) {
        reloadOnce();
        return;
      }
      if (target.state === "redundant") fail();
      // A waiting worker disappears during activation; keep progress visible.
      if (requested) return;
    }
    const waiting = registration.waiting;
    // The first cache install briefly passes through waiting before activating.
    // Offer an update only when it actually replaces another active worker.
    if (
      waiting?.state === "installed" &&
      registration.active &&
      registration.active !== waiting &&
      container.controller !== waiting
    ) {
      offered = waiting;
      if (phase !== "error") publish("available");
    } else if (
      phase === "available" &&
      (offered?.state === "redundant" ||
        (offered?.state === "activated" &&
          knownController === offered &&
          container.controller === offered))
    ) {
      offered = null;
      publish("idle");
    }
  }
  const controllerChanged = () => {
    if (disposed || refreshing) return;
    const current = container.controller;
    if (!current || current === knownController) {
      sync();
      return;
    }
    const firstClaim = !knownController;
    knownController = current;
    // Installing the offline cache for the first time must not interrupt practice.
    if (firstClaim && !requested) {
      sync();
      return;
    }
    // An initial old-worker claim can race with acceptance of a newer worker.
    if (requested && target && current !== target) {
      sync();
      return;
    }
    reloadOnce();
  };
  const recheck = () => {
    if (!disposed) void registration?.update().catch(() => {});
  };
  return {
    async start(scriptURL: string) {
      container.addEventListener("controllerchange", controllerChanged);
      try {
        const reg = await container.register(scriptURL, {
          updateViaCache: "none",
        });
        if (disposed) return;
        registration = reg;
        onRegistration?.(reg);
        reg.addEventListener("updatefound", sync);
        sync();
      } catch {
        if (!disposed) onRegistrationError();
      }
    },
    request() {
      if (disposed || refreshing || phase === "applying") return;
      const fresh = registration?.waiting;
      const candidate = fresh?.state === "installed" ? fresh : offered;
      if (!candidate || candidate.state === "redundant" || !registration) {
        fail();
        recheck();
        return;
      }
      target = candidate;
      requested = true;
      clearWait();
      publish("applying");
      watch(target);
      sync();
      if (refreshing) return;
      if (target.state === "activated") {
        fail();
        recheck();
        return;
      }
      timeout = setTimeout(() => {
        clearWait();
        publish("stalled");
      }, 12000);
      // Some suspended standalone sessions can miss lifecycle notifications.
      // Only reload after the offered version is confirmed active, never on time alone.
      poll = setInterval(sync, 500);
      try {
        if (target.state === "installed") target.postMessage("SKIP_WAITING");
      } catch {
        fail();
      }
    },
    resume(checkForUpdates = true) {
      sync();
      if (checkForUpdates) recheck();
    },
    dispose() {
      disposed = true;
      clearWait();
      container.removeEventListener("controllerchange", controllerChanged);
      registration?.removeEventListener("updatefound", sync);
      for (const worker of watched)
        worker.removeEventListener("statechange", sync);
      watched.clear();
    },
  };
}
