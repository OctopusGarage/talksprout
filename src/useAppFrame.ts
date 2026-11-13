import { useEffect, useLayoutEffect, useRef, useState } from "react";

export function useAppFrame(view: string) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const positions = useRef(new Map<string, number>());
  const activeView = useRef(view);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useLayoutEffect(() => {
    activeView.current = view;
    if (scrollRef.current)
      scrollRef.current.scrollTop = positions.current.get(view) ?? 0;
  }, [view]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const zoomed = Math.abs(viewport.scale - 1) > 0.05;
        const unzoomedHeight = viewport.height * viewport.scale;
        const mobile =
          innerWidth <= 760 || matchMedia("(pointer: coarse)").matches;
        const field = document.activeElement;
        const editing =
          (field instanceof HTMLInputElement &&
            !field.readOnly &&
            ![
              "checkbox",
              "radio",
              "button",
              "file",
              "range",
              "color",
              "submit",
              "reset",
            ].includes(field.type)) ||
          (field instanceof HTMLTextAreaElement && !field.readOnly);
        const keyboard =
          mobile && editing && innerHeight - unzoomedHeight > 120;
        setKeyboardOpen(keyboard);
        let height = innerHeight;
        if (mobile && !zoomed) height = viewport.height;
        else if (mobile && keyboard)
          height = Math.min(innerHeight, unzoomedHeight);
        document.documentElement.style.setProperty(
          "--app-height",
          `${height}px`,
        );
        document.documentElement.style.setProperty(
          "--app-top",
          `${keyboard && !zoomed ? viewport.offsetTop : 0}px`,
        );
        if (keyboard && field instanceof HTMLElement)
          field.scrollIntoView({ block: "nearest" });
      });
    };
    update();
    for (const event of ["resize", "scroll"])
      viewport.addEventListener(event, update);
    window.addEventListener("resize", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      cancelAnimationFrame(frame);
      for (const event of ["resize", "scroll"])
        viewport.removeEventListener(event, update);
      window.removeEventListener("resize", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
      document.documentElement.style.removeProperty("--app-height");
      document.documentElement.style.removeProperty("--app-top");
    };
  }, []);

  return {
    scrollRef,
    keyboardOpen,
    onScroll: () => {
      if (scrollRef.current)
        positions.current.set(activeView.current, scrollRef.current.scrollTop);
    },
  };
}
