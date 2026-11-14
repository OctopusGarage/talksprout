export interface ClipboardRequest {
  text: string;
  onDelivered?: () => void;
  onSuccess?: () => void;
  onFailure?: () => void;
}

/** One app-wide writer; feedback callbacks belong to the initiating view only. */
export function createClipboardWriter(
  writeText: (text: string) => Promise<void>,
  getContext: () => string,
  onBusyChange: (busy: boolean) => void = () => {},
) {
  let busy = false;
  let generation = 0;
  return {
    invalidate() { generation++; },
    async write(request: ClipboardRequest): Promise<boolean> {
      if (busy) return false;
      busy = true;
      const token = ++generation;
      const context = getContext();
      const current = () => token === generation && context === getContext();
      onBusyChange(true);
      try {
        try {
          // Invoke during the original click gesture, before any await.
          await writeText(request.text);
        } catch {
          if (current()) request.onFailure?.();
          return false;
        }
        request.onDelivered?.();
        if (current()) request.onSuccess?.();
        return true;
      } finally {
        busy = false;
        onBusyChange(false);
      }
    },
  };
}
export type ClipboardWriter = ReturnType<typeof createClipboardWriter>;
