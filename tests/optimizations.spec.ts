import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("first practice guide, collection focus and independent learning favorites", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "第一次练习建议" })).toBeVisible();
  await page.getByRole("button", { name: "收起指引", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("region", { name: "第一次练习建议" })).toHaveCount(0);
  await page.locator('[data-collection="companions"]').click();
  await page.getByRole("button", { name: "← 返回分类", exact: true }).click();
  await expect(page.locator('[data-collection="companions"]')).toBeFocused();
  await page.getByRole("button", { name: /听读写辅助/ }).click();
  await page.getByRole("button", { name: "收藏：视频与音频辅导", exact: true }).click();
  await page.getByRole("button", { name: "只看收藏", exact: true }).click();
  await expect(page.locator(".learning-prompt")).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole("button", { name: "取消收藏：视频与音频辅导", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("saved scene combinations restore format and pace without retaining private background", async ({ page }) => {
  await page.goto("/#library?prompt=roleplay-coach&scene=project-deep-dive&pace=mock&format=spoken");
  await expect(page.getByRole("tab", { name: "语音开场白", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "保存常用组合", exact: true }).click();
  await page.getByRole("tab", { name: "完整提示词", exact: true }).click();
  await page.locator(".scene-settings summary").click();
  await page.locator("#scene-background").fill("PRIVATE_BACKGROUND_8364");
  await page.getByRole("button", { name: "保存常用组合", exact: true }).click();
  const saved = await page.evaluate(() => localStorage.getItem("talksprout:practice-shortcuts"));
  expect(saved).not.toContain("PRIVATE_BACKGROUND_8364");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("region", { name: "常用练习组合" })).toBeVisible();
  await page.getByRole("button", { name: /情境扮演教练.*语音开场白/ }).click();
  await expect(page.getByRole("tab", { name: "语音开场白", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.locator(".scene-settings summary").click();
  await expect(page.locator("#scene-background")).toHaveValue("");
  await expect(page.getByRole("button", { name: "模拟面试", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("English rendered learning/review prompts and visible recent entries", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.resolve() } }));
  await page.goto("/#learning?prompt=writing-feedback");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: "Writing", exact: true }).click();
  await page.locator(".learning-prompt").filter({ hasText: "Writing feedback" }).click();
  await expect(page.locator("#prompt-text")).toHaveValue(/concise English explanations/);
  await page.getByRole("button", { name: "Copy prompt", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("region", { name: "Recently copied", exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("same-prompt URL removal resets options and multi-entry Back restores the collection opener", async ({ page }) => {
  await page.goto("/#library?prompt=roleplay-coach&scene=project-deep-dive&pace=mock&format=spoken");
  await expect(page.getByRole("tab", { name: "语音开场白", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.evaluate(() => { location.hash = "#library?prompt=roleplay-coach"; });
  await expect(page.getByRole("tab", { name: "完整提示词", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".scene-trigger")).toContainText("不指定场景");
  await page.goto("/");
  await page.locator('[data-collection="companions"]').click();
  await page.locator('[data-detail="daily-check-in"]').click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.evaluate(() => history.go(-2));
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator('[data-collection="companions"]')).toBeFocused();
});

test("manual fallback preserves the exact scene payload while shared links exclude background", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(Error("denied")) } }));
  await page.goto("/#library?prompt=roleplay-coach&scene=project-deep-dive&pace=mock");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.locator(".scene-settings summary").click();
  await page.locator("#scene-background").fill("PRIVATE_BACKGROUND_468");
  const payload = await page.locator("#prompt-text").inputValue();
  await page.getByRole("button", { name: "复制完整提示词", exact: true }).click();
  await expect(page.locator("#prompt-text")).toHaveValue(payload);
  await expect(page.locator("#prompt-text")).toBeFocused();
  await page.getByText("分享练习链接", { exact: true }).click();
  const link = await page.locator("#practice-link").inputValue();
  expect(link).toContain("scene=project-deep-dive");
  expect(link).toContain("pace=mock");
  expect(link).not.toContain("PRIVATE_BACKGROUND_468");
});
