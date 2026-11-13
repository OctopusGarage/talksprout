import react from "@vitejs/plugin-react";
import { defineConfig, type ResolvedConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
let config: ResolvedConfig;
export default defineConfig({
  base: process.env.BASE_PATH || "./",
  plugins: [
    react(),
    {
      name: "offline-worker",
      configResolved(resolved) {
        config = resolved;
      },
      generateBundle(_, bundle) {
        const publicFiles = [
          "./recover.html",
          "./manifest.webmanifest",
          "./icons/icon.svg",
          "./icons/icon-192.png",
          "./icons/icon-512.png",
          "./icons/apple-touch-icon.png",
        ];
        const files = [
          "./",
          ...publicFiles,
          ...Object.keys(bundle).map((p) => "./" + p),
        ];
        const entries: [string, Uint8Array][] = [
          ...Object.entries(bundle).map(
            ([name, asset]): [string, Uint8Array] => {
              const source = asset.type === "chunk" ? asset.code : asset.source;
              return [
                "./" + name,
                typeof source === "string" ? Buffer.from(source) : source,
              ];
            },
          ),
          ...publicFiles.map((name): [string, Uint8Array] => [
            name,
            readFileSync(resolve(config.publicDir, name)),
          ]),
        ];
        const digest = createHash("sha256");
        for (const [name, bytes] of entries.sort(([a], [b]) =>
          a.localeCompare(b),
        )) {
          digest.update(JSON.stringify([name, bytes.byteLength]) + "\n");
          digest.update(bytes);
        }
        const version = digest.digest("hex").slice(0, 12);
        this.emitFile({
          type: "asset",
          fileName: "sw.js",
          source: `const CACHE='talksprout-${version}';
const URLS=${JSON.stringify(files)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(URLS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('talksprout-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.open(CACHE).then(async cache=>{const cached=await cache.match(event.request,{ignoreSearch:true,ignoreVary:true});if(cached)return cached;try{return await fetch(event.request);}catch(error){if(event.request.mode==='navigate')return await cache.match(new URL('./',self.location.href));throw error;}}));});`,
        });
      },
    },
  ],
});
