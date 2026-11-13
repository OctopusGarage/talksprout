import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./style.css";
function ReadyApp() {
  useEffect(() => {
    const root = document.documentElement;
    const pointer = () => {
      root.dataset.inputMode = "pointer";
    };
    const keyboard = (event: KeyboardEvent) => {
      if (
        !event.metaKey &&
        !event.altKey &&
        !event.ctrlKey &&
        !["Shift", "Control", "Alt", "Meta"].includes(event.key)
      ) {
        root.dataset.inputMode = "keyboard";
      }
    };
    pointer();
    window.addEventListener("pointerdown", pointer, true);
    window.addEventListener("keydown", keyboard, true);
    window.dispatchEvent(new Event("talksprout:ready"));
    return () => {
      window.removeEventListener("pointerdown", pointer, true);
      window.removeEventListener("keydown", keyboard, true);
      delete root.dataset.inputMode;
    };
  }, []);
  return <App />;
}
createRoot(document.getElementById("app")!, {
  onUncaughtError() {
    window.dispatchEvent(new Event("talksprout:failed"));
  },
}).render(<ReadyApp />);
