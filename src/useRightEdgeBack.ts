import { useEffect, useRef } from "react";

interface Swipe {
  id: number;
  x: number;
  y: number;
  horizontal: boolean;
}

/** App-level gesture; native system navigation may cancel the touch sequence. */
export function useRightEdgeBack(onBack: (() => void) | null, view: string) {
  const callback = useRef(onBack);
  callback.current = onBack;
  const suppressClickUntil = useRef(0);
  useEffect(() => {
    let swipe: Swipe | null = null;
    const reset = () => {
      swipe = null;
    };
    const start = (event: TouchEvent) => {
      reset();
      if (!callback.current || event.touches.length !== 1) return;
      const touch = event.touches[0];
      const target = event.target;
      if (
        touch.clientX < innerWidth - 32 ||
        touch.clientX > innerWidth ||
        Math.abs((window.visualViewport?.scale ?? 1) - 1) > 0.05 ||
        (window.getSelection()?.toString().length ?? 0) > 0 ||
        (target instanceof Element &&
          target.closest(
            'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"]',
          ))
      )
        return;
      swipe = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        horizontal: false,
      };
    };
    const move = (event: TouchEvent) => {
      if (!swipe) return;
      if (event.touches.length !== 1) return reset();
      const touch = event.touches[0];
      if (touch.identifier !== swipe.id) return reset();
      const dx = swipe.x - touch.clientX;
      const dy = Math.abs(touch.clientY - swipe.y);
      if (!swipe.horizontal) {
        if (Math.max(Math.abs(dx), dy) < 12) return;
        if (dx <= dy * 1.5) return reset();
        swipe.horizontal = true;
      }
      // Once horizontal intent is established, keep scrolling from taking over.
      if (event.cancelable) event.preventDefault();
      else reset();
    };
    const end = (event: TouchEvent) => {
      const current = swipe;
      reset();
      if (!current || !current.horizontal || event.touches.length) return;
      const touch = Array.from(event.changedTouches).find(
        (t) => t.identifier === current.id,
      );
      if (!touch || (window.getSelection()?.toString().length ?? 0) > 0) return;
      const dx = current.x - touch.clientX;
      if (dx < 72 || dx < Math.abs(touch.clientY - current.y) * 1.5) return;
      if (event.cancelable) event.preventDefault();
      suppressClickUntil.current = Date.now() + 400;
      callback.current?.();
    };
    const click = (event: MouseEvent) => {
      if (Date.now() < suppressClickUntil.current && event.detail !== 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    document.addEventListener("touchstart", start, { passive: true, capture: true });
    document.addEventListener("touchmove", move, { passive: false, capture: true });
    document.addEventListener("touchend", end, { passive: false, capture: true });
    document.addEventListener("touchcancel", reset, true);
    document.addEventListener("click", click, true);
    window.addEventListener("blur", reset);
    return () => {
      document.removeEventListener("touchstart", start, true);
      document.removeEventListener("touchmove", move, true);
      document.removeEventListener("touchend", end, true);
      document.removeEventListener("touchcancel", reset, true);
      document.removeEventListener("click", click, true);
      window.removeEventListener("blur", reset);
    };
  }, [view]);
}
