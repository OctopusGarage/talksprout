import { useEffect, useRef, useState } from "react";
import { createClipboardWriter, type ClipboardWriter } from "./clipboard-writer";

export function usePromptClipboard() {
  const [copying, setCopying] = useState(false);
  const mounted = useRef(true);
  const writer = useRef<ClipboardWriter | null>(null);
  if (!writer.current) writer.current = createClipboardWriter(
    (text) => navigator.clipboard.writeText(text),
    () => location.href,
    (busy) => { if (mounted.current) setCopying(busy); },
  );
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; writer.current?.invalidate(); };
  }, []);
  return { copying, writer: writer.current };
}
