import { test, expect } from "@playwright/test";

test("app sharing copies the deployment home without route or query", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text: string) => { (window as unknown as { shared: string }).shared = text; } }, configurable: true });
  });
  await page.goto("/?refresh=123#settings");
  await page.getByRole("button", { name: "分享 TalkSprout", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { shared: string }).shared)).toBe("http://127.0.0.1:4173/");
  await expect(page.getByRole("status").filter({ hasText: "应用链接已复制" })).toBeVisible();
});

test("header invokes native sharing and cancellation stays quiet", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: async (data: ShareData) => {
      (window as unknown as { shared: ShareData }).shared = data;
      throw new DOMException("Cancelled", "AbortError");
    } });
  });
  await page.goto("/#guides");
  await page.getByRole("button", { name: "分享应用", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { shared: ShareData }).shared)).toMatchObject({ title: "TalkSprout 开口芽", url: "http://127.0.0.1:4173/" });
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator("#toast")).not.toHaveClass("visible");
});

test("failed sharing and clipboard expose a selectable home link", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => { throw new Error("unavailable"); } });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } });
  });
  await page.goto("/#library");
  await page.getByRole("button", { name: "分享应用", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "分享 TalkSprout" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "复制应用链接" }).click();
  await expect(dialog.getByRole("textbox")).toBeFocused();
  await expect(dialog.getByRole("textbox")).toHaveValue("http://127.0.0.1:4173/");
  await dialog.getByRole("button", { name: "关闭" }).click();
  await expect(dialog).not.toBeVisible();
});

test("unsupported sharing with denied clipboard opens manual fallback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } });
  });
  await page.goto("/#settings");
  await page.getByRole("button", { name: "分享 TalkSprout", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "分享 TalkSprout" });
  await expect(dialog.getByRole("textbox")).toBeFocused();
  await expect(dialog.getByRole("status")).toContainText("手动复制");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "分享 TalkSprout", exact: true })).toBeFocused();
});

test("English sharing remains usable on a narrow screen and native success does not copy", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.addInitScript(() => {
    localStorage.setItem("talksprout:locale", "en");
    Object.defineProperty(navigator, "share", { configurable: true, value: async (data: ShareData) => { (window as unknown as { shared: ShareData }).shared = data; } });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => { throw new Error("Native sharing should not copy"); } } });
  });
  await page.goto("/#library");
  const button = page.getByRole("button", { name: "Share app", exact: true });
  await expect(button).toBeInViewport();
  const bounds = await button.boundingBox();
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  await button.click();
  expect(await page.evaluate(() => (window as unknown as { shared: ShareData }).shared)).toMatchObject({ title: "TalkSprout", url: "http://127.0.0.1:4173/" });
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.screenshot({ path: "test-results/app-share-mobile.png" });
});
