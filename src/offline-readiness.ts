export type OfflineStatus = "installing" | "ready" | "unavailable" | "unknown";

/** A completed precache marker and every recorded response are required evidence. */
export async function getOfflineStatus(
  storage: CacheStorage,
  scope: string,
  installing: boolean,
): Promise<OfflineStatus> {
  try {
    const prefix = "talksprout-scope-" + encodeURIComponent(scope) + "-";
    for (const name of (await storage.keys()).filter(name => name.startsWith(prefix))) {
      const cache = await storage.open(name);
      const marker = await cache.match(new URL("__offline_ready__", scope).href);
      if (!marker) continue;
      const urls: unknown = await marker.json();
      if (!Array.isArray(urls) || urls.length === 0 || !urls.every(url => typeof url === "string" && url.startsWith(scope))) continue;
      if ((await Promise.all(urls.map(url => cache.match(url)))).every(Boolean)) return "ready";
    }
    return installing ? "installing" : "unknown";
  } catch {
    return "unavailable";
  }
}
