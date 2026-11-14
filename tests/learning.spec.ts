import { test, expect } from "@playwright/test";
import { learningPrompts } from "../src/content/learning";
import AxeBuilder from "@axe-core/playwright";

test("learning extras stay separate and preserve bilingual deep links and Back", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".collection-card")).toHaveCount(3);
  await page.getByRole("button", { name: /听读写辅助/ }).click();
  await expect(page).toHaveURL(/#learning$/);
  await expect(page.locator(".learning-prompt")).toHaveCount(6);
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  await page.getByRole("button", { name: /视频与音频辅导/ }).click();
  await expect(page.locator("#prompt-text")).toBeVisible();
  await expect(page.getByRole("tablist")).toHaveCount(0);
  await expect(page.locator(".scenario-settings")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/#learning$/);
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("#library-heading")).toHaveText("Listening, reading & writing");
  await page.reload();
  await expect(page.locator("#library-heading")).toHaveText("Listening, reading & writing");
  await page.getByRole("button", { name: "← Back to practice", exact: true }).click();
  await page.getByRole("searchbox").fill("Listening");
  await expect(page.locator(".card")).toHaveCount(0);
});

test("learning copy failure selects exact prompt and a dismissed pending copy stays dismissed", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true, value: { writeText: (text: string) => {
      (window as any).copiedLearningText = text;
      return Promise.reject(Error("denied"));
    } },
  }));
  await page.goto("/#learning?prompt=writing-feedback");
  const original = await page.locator("#prompt-text").inputValue();
  await page.getByRole("button", { name: "复制提示词", exact: true }).click();
  expect(await page.evaluate(() => (window as any).copiedLearningText)).toBe(original);
  await expect(page.locator("#prompt-text")).toBeFocused();
  expect(await page.locator("#prompt-text").evaluate((el: HTMLTextAreaElement) => el.selectionEnd - el.selectionStart)).toBe(original.length);
  await page.keyboard.press("Escape");
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true, value: { writeText: () => new Promise((_resolve, reject) => { (window as any).rejectLearningCopy = reject; }) },
  }));
  await page.getByRole("button", { name: /场景写作练习/ }).click();
  await page.getByRole("button", { name: "复制提示词", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.evaluate(() => (window as any).rejectLearningCopy(Error("late")));
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("all supplementary prompts copy exactly and share the clipboard lock with speaking", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: (text: string) => { (window as any).copiedLearningText = text; return Promise.resolve(); } },
  }));
  await page.goto("/#learning");
  for (const { id, prompt } of learningPrompts) {
    await page.goto(`/#learning?prompt=${id}`);
    await expect(page.locator("#prompt-text")).toHaveValue(prompt);
    const expected = prompt;
    await page.getByRole("button", { name: "复制提示词", exact: true }).click();
    await expect(page.getByRole("button", { name: "已复制 ✓", exact: true })).toBeVisible();
    expect(await page.evaluate(() => (window as any).copiedLearningText)).toBe(expected);
  }
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: () => new Promise<void>((resolve) => { (window as any).resolveLearningCopy = resolve; }) },
  }));
  await page.goto("/#learning?prompt=writing-feedback");
  await page.getByRole("button", { name: "复制提示词", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "← 返回练习", exact: true }).click();
  await page.getByRole("button", { name: /日常陪练/ }).click();
  await expect(page.locator(".copy").first()).toBeDisabled();
  await page.evaluate(() => (window as any).resolveLearningCopy());
  await expect(page.locator(".copy").first()).toBeEnabled();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
