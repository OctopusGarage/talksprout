import { test, expect } from "@playwright/test";
import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";

let server: Server;
let origin: string;
test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    const pathname = new URL(request.url!, "http://localhost").pathname;
    const path = pathname.replace(/^\/(one|two)\//, "") || "index.html";
    const mime: Record<string, string> = { ".js": "application/javascript", ".html": "text/html", ".css": "text/css", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png" };
    try {
      response.setHeader("Content-Type", mime[extname(path)] || "application/octet-stream");
      response.setHeader("Cache-Control", "no-store");
      response.end(await readFile(resolve("dist", path)));
    } catch { response.writeHead(404).end(); }
  });
  await new Promise<void>(done => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw Error("No test server");
  origin = "http://127.0.0.1:" + address.port;
});
test.afterAll(async () => {
  await new Promise<void>((done, reject) => server.close(error => error ? reject(error) : done()));
});

test("two deployed paths retain independent caches across activation and recovery", async ({ context, page }) => {
  const other = await context.newPage();
  const prefix = (path: string) => "talksprout-scope-" + encodeURIComponent(origin + path) + "-";
  await page.goto(origin + "/one/");
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await expect.poll(() => page.evaluate(() => caches.keys())).toContainEqual(expect.stringMatching(new RegExp("^" + prefix("/one/"))));
  await other.goto(origin + "/two/");
  await other.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  const names = await page.evaluate(() => caches.keys());
  expect(names.some(name => name.startsWith(prefix("/one/")))).toBe(true);
  expect(names.some(name => name.startsWith(prefix("/two/")))).toBe(true);
  // Recovery must not delete the second installation, or ambiguous legacy data.
  await page.evaluate(() => caches.open("talksprout-legacy-fixture"));
  await page.goto(origin + "/one/recover.html");
  await page.locator("#reload").click();
  await page.waitForURL(url => url.pathname === "/one/");
  const afterRecovery = await other.evaluate(() => caches.keys());
  expect(afterRecovery.some(name => name.startsWith(prefix("/two/")))).toBe(true);
  expect(afterRecovery).toContain("talksprout-legacy-fixture");
  await context.setOffline(true);
  await other.reload();
  await expect(other.locator("#app")).not.toBeEmpty();
});
