import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("practical learning directions remain compact, bilingual and accessible on narrow phones", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/#learning");
  await expect(page.getByRole("group", { name: "学习方向" })).toBeVisible();
  await expect(page.getByRole("button", { name: "听力", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".learning-prompt")).toHaveCount(6);
  await page.getByRole("button", { name: "阅读", exact: true }).click();
  await expect(page.locator(".learning-prompt").filter({ hasText: "读懂技术文档" })).toBeVisible();
  await expect(page.locator(".learning-prompt").filter({ hasText: "听写对照" })).toHaveCount(0);
  await page.getByRole("button", { name: "写作", exact: true }).click();
  await page.locator(".learning-prompt").filter({ hasText: "邮件回复" }).click();
  await expect(page.locator("#prompt-text")).toHaveValue(/email/);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "写作", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByRole("button", { name: "Writing", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".learning-prompt").filter({ hasText: "Email replies" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
