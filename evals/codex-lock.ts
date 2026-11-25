import {
  openSync,
  writeFileSync,
  closeSync,
  readFileSync,
  unlinkSync,
} from "node:fs";
import { randomUUID } from "node:crypto";
/** Serialize entire invocations, not just writes within one worker pool. Never auto-break a lock. */
export function acquireCodexLock(path: string): () => void {
  const token = randomUUID();
  let fd: number;
  try {
    fd = openSync(path, "wx", 0o600);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST")
      throw Error(
        "Another Codex evaluation owns " +
          path +
          ". If a prior process was killed, confirm its recorded PID is no longer running before removing this stale lock.",
      );
    throw error;
  }
  try {
    writeFileSync(
      fd,
      JSON.stringify({
        pid: process.pid,
        startedAt: new Date().toISOString(),
        token,
      }) + "\n",
    );
  } finally {
    closeSync(fd);
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    try {
      if (JSON.parse(readFileSync(path, "utf8")).token === token)
        unlinkSync(path);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  };
}
