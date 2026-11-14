import type { OfflineStatus } from './offline-readiness';

interface OfflineCheckOptions<Handle> {
  read: () => Promise<OfflineStatus>;
  publish: (status: OfflineStatus) => void;
  visible: () => boolean;
  schedule: (callback: () => void, delay: number) => Handle;
  cancel: (handle: Handle) => void;
}

/** One immediate read and five retries per burst; events can begin a fresh burst. */
export function createOfflineCheck<Handle>(options: OfflineCheckOptions<Handle>) {
  const delays = [2000, 4000, 8000, 16000, 30000];
  let timer: Handle | undefined;
  let active = false;
  let checking = false;
  let disposed = false;
  let generation = 0;
  let retries = 0;
  let pending = false;
  function stop() {
    generation++;
    active = false;
    pending = false;
    if (timer !== undefined) options.cancel(timer);
    timer = undefined;
  }
  async function check() {
    if (disposed || !active || !options.visible()) return;
    if (checking) { pending = true; return; }
    checking = true;
    const current = generation;
    let status: OfflineStatus;
    try { status = await options.read(); } catch { status = 'unavailable'; }
    checking = false;
    if (disposed) return;
    if (current === generation && active && options.visible()) {
      options.publish(status);
      const delay = delays[retries];
      if ((status === 'unknown' || status === 'installing') && delay !== undefined) {
        retries++;
        timer = options.schedule(() => { timer = undefined; void check(); }, delay);
      } else active = false;
    }
    if (pending) { pending = false; void check(); }
  }
  function resume() {
    if (disposed || active || !options.visible()) return;
    active = true;
    retries = 0;
    void check();
  }
  return {
    resume,
    restart() { if (!disposed) { stop(); resume(); } },
    suspend: stop,
    dispose() { stop(); disposed = true; },
  };
}
