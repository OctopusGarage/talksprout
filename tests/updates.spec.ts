import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";

test("real worker updates reload once after initial claim and on return visits", async ({
  page,
  context,
}) => {
  const dist = resolve(import.meta.dirname, "../dist");
  let release = 0;
  const server = createServer(async (request, response) => {
    try {
      const path = new URL(request.url!, "http://localhost").pathname;
      if (!path.startsWith("/practice/")) {
        response.writeHead(404).end();
        return;
      }
      const relative = path.slice("/practice/".length) || "index.html";
      const file = resolve(dist, relative);
      if (!file.startsWith(dist + "/")) {
        response.writeHead(404).end();
        return;
      }
      let body = await readFile(file);
      if (relative === "sw.js")
        body = Buffer.from(
          body
            .toString()
            .replace(/const CACHE=PREFIX\+'([a-f0-9]+)';/, `const CACHE=PREFIX+'$1-test${release}';`),
        );
      const mime: Record<string, string> = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".webmanifest": "application/manifest+json",
      };
      response.writeHead(200, {
        "Content-Type": mime[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing server port");
  const url = `http://127.0.0.1:${address.port}/practice/`;
  try {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        "loads",
        String(Number(sessionStorage.getItem("loads") || 0) + 1),
      );
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        sessionStorage.setItem(
          "changes",
          String(Number(sessionStorage.getItem("changes") || 0) + 1),
        );
      });
    });
    const loads = () =>
      page.evaluate(() => Number(sessionStorage.getItem("loads")));
    async function expectNoUpdate() {
      try {
        await expect(page.locator("#update")).toHaveCount(0);
      } catch (error) {
        console.error(
          "Worker lifecycle at unexpected banner",
          await page.evaluate(async () => {
            const reg = await navigator.serviceWorker.ready;
            return {
              controller: navigator.serviceWorker.controller?.state,
              active: reg.active?.state,
              waiting: reg.waiting?.state,
              installing: reg.installing?.state,
              loads: sessionStorage.getItem("loads"),
              banner: document.getElementById("update-bar")?.textContent,
            };
          }),
        );
        throw error;
      }
    }

    await page.goto(url);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await expect
      .poll(() => page.evaluate(() => sessionStorage.getItem("changes")))
      .toBe("1");
    expect(await loads()).toBe(1);
    await expectNoUpdate();
    await page.locator(".language-shortcut").click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.locator('[data-collection="companions"]').click();
    const favorite = page.locator('[data-favorite="daily-check-in"]');
    await favorite.click();
    await expect(favorite).toHaveAttribute("aria-pressed", "true");
    async function update(expectedLoads: number) {
      release++;
      await page.evaluate(async () => {
        await (await navigator.serviceWorker.ready).update();
      });
      await expect(page.locator("#update")).toBeVisible();
      // Installing a waiting worker must not reload; only explicit acceptance does.
      expect(await loads()).toBe(expectedLoads - 1);
      await Promise.all([
        page.waitForEvent(
          "framenavigated",
          (frame) => frame === page.mainFrame(),
        ),
        page.locator("#update").click(),
      ]);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("#library-heading")).toBeVisible();
      expect(await loads()).toBe(expectedLoads);
      await expectNoUpdate();
      await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.ready;
        if (registration.waiting || registration.installing)
          throw new Error("Update still pending");
      });
      // The original first-visit closure leaves this count at 1 after acceptance,
      // so the navigation wait above times out against the pre-fix App.
      await page.evaluate(
        () =>
          new Promise<void>((done) =>
            requestAnimationFrame(() => requestAnimationFrame(() => done())),
          ),
      );
      expect(await loads()).toBe(expectedLoads);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.locator("#library-heading")).toHaveText(
        "Conversation coaches",
      );
      await expect(favorite).toHaveAttribute("aria-pressed", "true");
      expect(
        await page.evaluate(() => localStorage.getItem("talksprout:favorites")),
      ).toBe('["daily-check-in"]');
      expect(
        await page.evaluate(() => localStorage.getItem("talksprout:locale")),
      ).toBe("en");
    }
    await update(2);
    await page.reload();
    await expect(page.locator("#library-heading")).toBeVisible();
    expect(await loads()).toBe(3);
    await update(4);
    await context.setOffline(true);
    await page.goto(url + "recover.html");
    await expect(page.locator("#reload")).toBeVisible();
    await expect(page.locator("#message")).toContainText("favorites");
  } finally {
    await context.setOffline(false);
    await page.close();
    await new Promise<void>((done, reject) =>
      server.close((error) => (error ? reject(error) : done())),
    );
  }
});
