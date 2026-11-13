import { test, expect, type Page } from "@playwright/test";
import { prompts, reviewPrompts } from "../src/prompts";
import { promptText } from "../src/prompt-text";

declare global {
  interface Window {
    clipboardProbe: {
      writes: string[];
      resolve: (index: number) => void;
      reject: (index: number) => void;
    };
  }
}
async function settle(page: Page, index: number, success: boolean) {
  await page.evaluate(
    ({ index, success }) =>
      success
        ? window.clipboardProbe.resolve(index)
        : window.clipboardProbe.reject(index),
    { index, success },
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const callbacks: {
      resolve: () => void;
      reject: (reason: Error) => void;
    }[] = [];
    const writes: string[] = [];
    window.clipboardProbe = {
      writes,
      resolve: (index) => callbacks[index].resolve(),
      reject: (index) => callbacks[index].reject(Error("Clipboard denied")),
    };
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (value: string) => {
          writes.push(value);
          return new Promise<void>((resolve, reject) =>
            callbacks.push({ resolve, reject }),
          );
        },
      },
    });
  });
});
test("late clipboard rejection cannot reverse navigation", async ({ page }) => {
  await page.goto("/#collection/companions");
  await page.locator('.copy[data-copy="daily-check-in"]').click();
  await page.getByRole("link", { name: "结束与复习", exact: true }).click();
  await settle(page, 0, false);
  await expect(page).toHaveURL(/#review$/);
  await expect(page.locator("#detail")).toHaveCount(0);
});
test("late rejection cannot reopen a dismissed sheet even after reopening the same prompt", async ({
  page,
}) => {
  await page.goto("/#collection/companions");
  await page.locator('.detail-link[data-detail="daily-check-in"]').click();
  await page.locator(".modal-copy").click();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/#collection\/companions$/);
  await page.locator('.detail-link[data-detail="daily-check-in"]').click();
  await settle(page, 0, false);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.locator(".modal-copy")).toHaveText("复制完整提示词");
});
test("a completed full copy cannot mark the spoken format copied", async ({
  page,
}) => {
  await page.goto("/#collection/companions");
  await page.locator('.detail-link[data-detail="daily-check-in"]').click();
  await page.locator(".modal-copy").click();
  await page.locator("#format-spoken").click();
  await settle(page, 0, true);
  await expect(page.locator(".modal-copy")).toHaveText("复制语音开场白");
  await page.locator(".modal-copy").click();
  await settle(page, 1, true);
  await expect(page.locator(".modal-copy")).toHaveText("已复制 ✓");
  expect(await page.evaluate(() => window.clipboardProbe.writes)).toEqual([
    prompts[0].prompt,
    prompts[0].spokenPrompt,
  ]);
});
test("a completed transcript copy cannot mark a different source copied", async ({
  page,
}) => {
  await page.goto("/#review");
  await page
    .locator('.detail-link[data-detail="complete-study-notes"]')
    .click();
  await page.locator("#review-source").selectOption("transcript");
  await page.locator(".modal-copy").click();
  await page.locator("#review-source").selectOption("current");
  await settle(page, 0, true);
  await expect(page.locator(".modal-copy")).toHaveText("复制完整提示词");
  expect(await page.evaluate(() => window.clipboardProbe.writes[0])).toBe(
    promptText(reviewPrompts[0], "full", "transcript"),
  );
});
test("one clipboard write at a time prevents out-of-order payloads", async ({
  page,
}) => {
  await page.goto("/#collection/companions");
  const first = page.locator('.copy[data-copy="daily-check-in"]');
  const second = page.locator('.copy[data-copy="gentle-start"]');
  await first.click();
  await expect(second).toBeDisabled();
  expect(await page.evaluate(() => window.clipboardProbe.writes.length)).toBe(
    1,
  );
  await settle(page, 0, true);
  await second.click();
  await settle(page, 1, true);
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("talksprout:recent") || "[]"),
    ),
  ).toEqual(["gentle-start", "daily-check-in"]);
});
test("same-context clipboard failure retains the exact selected payload for manual copying", async ({
  page,
}) => {
  await page.goto("/#review");
  await page
    .locator('.detail-link[data-detail="vocabulary-ipa-review"]')
    .click();
  await page.locator("#format-spoken").click();
  await page.locator(".modal-copy").click();
  await settle(page, 0, false);
  await expect(page.getByRole("alert")).toContainText("手动复制");
  await expect(page.locator("#prompt-text")).toHaveValue(
    reviewPrompts.find((p) => p.id === "vocabulary-ipa-review")!.spokenPrompt,
  );
  await expect(page.locator("#prompt-text")).toBeFocused();
});
test("clipboard completion from a closed sheet does not change a new sheet", async ({
  page,
}) => {
  await page.goto("/#collection/companions");
  await page.locator('.detail-link[data-detail="daily-check-in"]').click();
  await page.locator(".modal-copy").click();
  await page.keyboard.press("Escape");
  await page.locator('.detail-link[data-detail="gentle-start"]').click();
  await settle(page, 0, true);
  await expect(page.locator("#dialog-title")).toHaveText("温柔引导纠正");
  await expect(page.locator(".modal-copy")).toHaveText("复制完整提示词");
});

test("an offline-cache warning never claims that a prompt was copied", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.serviceWorker, "register", {
      configurable: true,
      value: () =>
        new Promise((_resolve, reject) => {
          (
            window as unknown as { rejectRegistration: () => void }
          ).rejectRegistration = () => reject(Error("Cache unavailable"));
        }),
    });
  });
  await page.goto("/#collection/companions");
  await page.locator('.detail-link[data-detail="daily-check-in"]').click();
  await page.evaluate(() =>
    (
      window as unknown as { rejectRegistration: () => void }
    ).rejectRegistration(),
  );
  await expect(page.locator('.sheet-footer [role="status"]')).toContainText(
    "离线缓存暂不可用",
  );
  await expect(page.locator(".modal-copy")).toHaveText("复制完整提示词");
  expect(await page.evaluate(() => window.clipboardProbe.writes.length)).toBe(
    0,
  );
});
