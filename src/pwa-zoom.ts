interface ZoomInput {
  type: string;
  touches?: number;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  key?: string;
}
export function shouldBlockZoom(installed: boolean, input: ZoomInput): boolean {
  return (
    installed &&
    (((input.type === "touchstart" || input.type === "touchmove") &&
      (input.touches ?? 0) > 1) ||
      input.type === "gesturestart" ||
      input.type === "gesturechange" ||
      (input.type === "wheel" && !!input.ctrlKey) ||
      (input.type === "keydown" &&
        !!(input.ctrlKey || input.metaKey) &&
        !input.altKey &&
        ["+", "=", "-", "0"].includes(input.key ?? "")))
  );
}
/** Installed windows use app gestures; browser tabs retain browser zoom. */
export function installPwaZoomGuard(): () => void {
  const display = window.matchMedia("(display-mode: standalone)");
  const root = document.documentElement;
  const update = () => {
    root.toggleAttribute(
      "data-installed-app",
      display.matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true,
    );
  };
  const prevent = (event: Event) => {
    if (
      shouldBlockZoom(root.hasAttribute("data-installed-app"), {
        type: event.type,
        touches:
          "touches" in event ? (event as TouchEvent).touches.length : undefined,
        ctrlKey: "ctrlKey" in event && (event as WheelEvent).ctrlKey,
        metaKey: "metaKey" in event && (event as KeyboardEvent).metaKey,
        altKey: "altKey" in event && (event as KeyboardEvent).altKey,
        key: "key" in event ? (event as KeyboardEvent).key : undefined,
      }) &&
      event.cancelable
    )
      event.preventDefault();
  };
  update();
  display.addEventListener("change", update);
  const events = [
    "touchstart",
    "touchmove",
    "gesturestart",
    "gesturechange",
    "wheel",
    "keydown",
  ];
  for (const name of events)
    document.addEventListener(name, prevent, { passive: false, capture: true });
  return () => {
    display.removeEventListener("change", update);
    for (const name of events)
      document.removeEventListener(name, prevent, true);
    root.removeAttribute("data-installed-app");
  };
}
