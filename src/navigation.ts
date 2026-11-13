import { useEffect, useState } from "react";
import { collections } from "./content/collections";
import { allPrompts } from "./prompts";

export type AppPage = "practice" | "review" | "settings";
export interface AppRoute {
  page: AppPage;
  collection: string | null;
  base: string;
  promptId: string | null;
  infoId: "install" | "about" | null;
}
export function readRoute(hash = location.hash): AppRoute {
  const [path, search = ""] = hash.replace(/^#/, "").split("?");
  const collection =
    collections.find((c) => path === `collection/${c.id}`)?.id ?? null;
  const page: AppPage =
    path === "settings"
      ? "settings"
      : path === "review" || path === "collection/review"
        ? "review"
        : "practice";
  const base =
    page === "settings"
      ? "#settings"
      : page === "review"
        ? "#review"
        : collection
          ? `#collection/${collection}`
          : "#library";
  const requested = new URLSearchParams(search).get("prompt");
  const prompt = allPrompts.find((p) => p.id === requested);
  const promptId =
    prompt &&
    page !== "settings" &&
    (prompt.kind === "review") === (page === "review")
      ? prompt.id
      : null;
  const requestedInfo = new URLSearchParams(search).get("info");
  const infoId =
    page === "settings" &&
    (requestedInfo === "install" || requestedInfo === "about")
      ? requestedInfo
      : null;
  return { page, collection, base, promptId, infoId };
}
export function navigate(hash: string, state: unknown = null) {
  if (location.hash === hash) return;
  history.pushState(state, "", hash);
  window.dispatchEvent(new Event("talksprout:navigate"));
}
export function useNavigation() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener("hashchange", update);
    window.addEventListener("popstate", update);
    window.addEventListener("talksprout:navigate", update);
    return () => {
      window.removeEventListener("hashchange", update);
      window.removeEventListener("popstate", update);
      window.removeEventListener("talksprout:navigate", update);
    };
  }, []);
  return route;
}
