import { test, expect, type Page } from "@playwright/test";
import { prompts } from "../src/prompts";
async function openFolder(page: Page, id: string) {
  await page.locator(`[data-collection="${id}"]`).click();
}
test("directory first: three folders and no flat wall of prompts", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".collection-card")).toHaveCount(3);
  await expect(page.locator(".card")).toHaveCount(0);
  await openFolder(page, "companions");
  await expect(page.locator(".card")).toHaveCount(4);
  await expect(page).toHaveURL(/#collection\/companions$/);
  await page.goBack();
  await expect(page.locator(".collection-card")).toHaveCount(3);
  await expect(page.locator(".card")).toHaveCount(0);
  await openFolder(page, "materials");
  await expect(page.locator(".card")).toHaveCount(2);
});
test("each retained coach is reachable in exactly one collection", async ({
  page,
}) => {
  const seen: string[] = [];
  for (const [id, count] of [
    ["companions", 4],
    ["interaction", 3],
    ["materials", 2],
  ] as const) {
    await page.goto("/#library");
    await openFolder(page, id);
    await expect(page.locator(".card")).toHaveCount(count);
    const ids = await page
      .locator(".card .copy")
      .evaluateAll((es) => es.map((e) => e.getAttribute("data-copy")!));
    seen.push(...ids);
    for (const promptId of ids) {
      await page.locator(`.detail-link[data-detail="${promptId}"]`).click();
      await expect(page.locator("#prompt-text")).toHaveValue(
        prompts.find((p) => p.id === promptId)!.prompt,
      );
      await page.keyboard.press("Escape");
    }
  }
  expect(new Set(seen)).toEqual(new Set(prompts.map((p) => p.id)));
  expect(seen.length).toBe(9);
});
test("copy, favorites, global search and exact dialog payload", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#collection/interaction");
  await page.locator('[data-favorite="roleplay-coach"]').click();
  await page.locator('.copy[data-copy="roleplay-coach"]').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    prompts.find((p) => p.id === "roleplay-coach")!.prompt,
  );
  await page.reload();
  await page.locator("#favorites").click();
  await expect(page.locator(".card")).toHaveCount(1);
  await page.getByRole("searchbox").fill("no-such-coach");
  await expect(page.locator(".card")).toHaveCount(0);
  await page.getByRole("searchbox").fill("");
  await page.locator("#favorites").click();
  await page.getByRole("searchbox").fill("猜词");
  await expect(page.locator(".card")).toHaveCount(1);
  await page.locator('.detail-link[data-detail="word-riddle"]').click();
  await expect(page.locator("#prompt-text")).toHaveValue(/guessing game/);
  await page.keyboard.press("Escape");
});
test("manual copy fallback provides selectable complete text", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(Error("denied")) },
    }),
  );
  await page.goto("/#collection/companions");
  await page.locator('.copy[data-copy="daily-check-in"]').click();
  await expect(page.getByRole("alert")).toContainText("手动复制");
  await expect(page.locator("#prompt-text")).toHaveValue(
    prompts.find((p) => p.id === "daily-check-in")!.prompt,
  );
});
test("offline reload supports folder deep links and favorites", async ({
  page,
  context,
}) => {
  await page.goto("/#collection/companions");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener("controllerchange", resolve, {
          once: true,
        }),
      );
  });
  await page.locator('[data-favorite="gentle-start"]').click();
  // A Web Lock may complete after the click; wait for the persisted selection.
  await expect(page.locator('[data-favorite="gentle-start"]')).toHaveAttribute("aria-pressed", "true");
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".card")).toHaveCount(4);
  await expect(page.locator("#connection")).toHaveText("离线模式 · 练习依然在");
  await page.locator("#favorites").click();
  await expect(page.locator(".card")).toHaveCount(1);
});
