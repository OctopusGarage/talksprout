import { test, expect, type Page } from "@playwright/test";
import { PNG } from "pngjs";
import AxeBuilder from "@axe-core/playwright";
import jsQR from "jsqr";
import { readFile } from "node:fs/promises";

async function openShare(page: Page, settings = false) {
  await page.getByRole("button", { name: settings ? "分享 TalkSprout" : "分享应用", exact: true }).click();
  return page.getByRole("dialog", { name: "分享 TalkSprout" });
}

test("share hub copies the deployment home without route or private query", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text: string) => { (window as unknown as { copied: string }).copied = text; } } }));
  await page.goto("/?private=PRIVATE_468#settings");
  const dialog = await openShare(page, true);
  await dialog.getByRole("button", { name: "复制应用链接", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toBe("http://127.0.0.1:4173/");
  await expect(dialog.getByRole("status").filter({ hasText: "应用链接已复制" })).toBeVisible();
});

test("native link sharing and cancellation keep the card available", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "share", { configurable: true, value: async (data: ShareData) => {
    (window as unknown as { shared: ShareData }).shared = data;
    throw new DOMException("Cancelled", "AbortError");
  } }));
  await page.goto("/#guides");
  const dialog = await openShare(page);
  await dialog.getByRole("button", { name: "分享应用链接", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { shared: ShareData }).shared)).toMatchObject({ title: "TalkSprout 开口芽", url: "http://127.0.0.1:4173/" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("status").filter({ hasText: /失败/ })).toHaveCount(0);
  await expect(dialog.getByRole("img", { name: /二维码分享卡片/ })).toBeVisible();
});

test("denied clipboard selects the clean link and dismissal restores focus", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } }));
  await page.goto("/#settings");
  const dialog = await openShare(page, true);
  await dialog.getByRole("button", { name: "复制应用链接", exact: true }).click();
  await expect(dialog.getByRole("textbox")).toHaveValue("http://127.0.0.1:4173/");
  await expect(dialog.getByRole("textbox")).toBeFocused();
  await expect(dialog.getByRole("status").filter({ hasText: "手动复制" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "分享 TalkSprout", exact: true })).toBeFocused();
});

test("downloaded PNG decodes to the app home and share dialog provides iPhone opening instructions", async ({ page }) => {
  await page.goto("/?private=PRIVATE_468#settings");
  const dialog = await openShare(page, true);
  const preview = dialog.getByRole("img", { name: /二维码分享卡片/ });
  await expect(preview).toBeVisible();
  await expect(dialog.getByText("二维码在另一块屏幕上", { exact: true })).toBeVisible();
  await expect(dialog.getByText("图片就在这台 iPhone 上", { exact: true })).toBeVisible();
  const downloading = page.waitForEvent("download");
  await dialog.getByRole("link", { name: "下载分享卡片", exact: true }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("talksprout-share-zh.png");
  const png = PNG.sync.read(await readFile((await download.path())!));
  expect(png.width).toBe(1080);
  expect(png.height).toBeGreaterThan(1500);
  expect(jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data).toBe("http://127.0.0.1:4173/");
  const reduced = await preview.evaluate(async (img: HTMLImageElement) => {
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 360;
    canvas.height = Math.round(img.naturalHeight * 360 / img.naturalWidth);
    const context = canvas.getContext("2d")!;
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { width: canvas.width, height: canvas.height, data: Array.from(context.getImageData(0, 0, canvas.width, canvas.height).data) };
  });
  expect(jsQR(new Uint8ClampedArray(reduced.data), reduced.width, reduced.height)?.data).toBe("http://127.0.0.1:4173/");
  await download.saveAs("test-results/talksprout-share-zh.png");
});

test("file sharing sends a PNG and cancellation preserves download", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "canShare", { configurable: true, value: (data: ShareData) => !!data.files?.length });
    Object.defineProperty(navigator, "share", { configurable: true, value: async (data: ShareData) => {
      const file = data.files![0];
      (window as unknown as { sharedFile: { name: string; type: string; size: number } }).sharedFile = { name: file.name, type: file.type, size: file.size };
      throw new DOMException("Cancelled", "AbortError");
    } });
  });
  await page.goto("/#library");
  const dialog = await openShare(page);
  await dialog.getByRole("button", { name: "分享卡片图片", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { sharedFile: unknown }).sharedFile)).toMatchObject({ name: "talksprout-share-zh.png", type: "image/png" });
  await expect(dialog.getByRole("link", { name: "下载分享卡片", exact: true })).toBeVisible();
  await expect(dialog.getByRole("status").filter({ hasText: /失败/ })).toHaveCount(0);
});

test("English card and download remain available offline on a narrow screen", async ({ page, context }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.addInitScript(() => localStorage.setItem("talksprout:locale", "en"));
  await page.goto("/#settings");
  await expect(page.getByText("Offline content is ready.", { exact: false })).toBeVisible({ timeout: 30000 });
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Share app", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Share TalkSprout" });
  await expect(dialog.getByRole("img", { name: /QR sharing card/ })).toBeVisible();
  expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await expect(dialog.getByText("On another screen", { exact: true })).toBeVisible();
  const downloading = page.waitForEvent("download");
  await dialog.getByRole("link", { name: "Download share card", exact: true }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("talksprout-share-en.png");
  await download.saveAs("test-results/talksprout-share-en.png");
  await page.screenshot({ path: "test-results/share-card-mobile.png" });
});

test("card export failure offers retry while link copying stays usable", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.toBlob;
    (window as unknown as { restorePng: () => void }).restorePng = () => { HTMLCanvasElement.prototype.toBlob = original; };
    HTMLCanvasElement.prototype.toBlob = function (callback) { callback(null); };
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => {} } });
  });
  await page.goto("/#library");
  const dialog = await openShare(page);
  await expect(dialog.getByText("卡片暂未生成，你仍可复制链接分享。", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "复制应用链接", exact: true }).click();
  await expect(dialog.getByRole("status").filter({ hasText: "应用链接已复制" })).toBeVisible();
  await page.evaluate(() => (window as unknown as { restorePng: () => void }).restorePng());
  await dialog.getByRole("button", { name: "重新生成卡片", exact: true }).click();
  await expect(dialog.getByRole("img", { name: /二维码分享卡片/ })).toBeVisible();
});

test("failed image sharing keeps the download and preview available", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => { throw new DOMException("denied", "NotAllowedError"); } });
  });
  await page.goto("/#library");
  const dialog = await openShare(page);
  await dialog.getByRole("button", { name: "分享卡片图片", exact: true }).click();
  await expect(dialog.getByRole("status").filter({ hasText: "图片未能分享" })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "下载分享卡片", exact: true })).toBeVisible();
  await expect(dialog.getByRole("img", { name: /二维码分享卡片/ })).toBeVisible();
});

test("closing releases the generated image and navigation dismisses the share hub", async ({ page }) => {
  await page.goto("/#library");
  const dialog = await openShare(page);
  const preview = dialog.getByRole("img", { name: /二维码分享卡片/ });
  await expect(preview).toBeVisible();
  const src = (await preview.getAttribute("src"))!;
  await dialog.getByRole("button", { name: "关闭", exact: true }).click();
  expect(await page.evaluate(async url => { try { await fetch(url); return false; } catch { return true; } }, src)).toBe(true);
  await openShare(page);
  await page.evaluate(() => { location.hash = "#settings"; });
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "分享 TalkSprout", exact: true })).toBeVisible();
});


test("share hub is accessible and its close control stays visible while scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/#library");
  const dialog = await openShare(page);
  await expect(dialog.getByRole("img", { name: /二维码分享卡片/ })).toBeVisible();
  const results = await new AxeBuilder({ page }).include(".app-share-dialog").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
  await dialog.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect(dialog.getByRole("button", { name: "关闭", exact: true })).toBeInViewport();
  await dialog.getByRole("button", { name: "关闭", exact: true }).click();
  await expect(page.getByRole("button", { name: "分享应用", exact: true })).toBeFocused();
});
