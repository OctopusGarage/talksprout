import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { prompts } from "../src/prompts";
test("spoken openings are readable, copy exactly, and never replace full card copies", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#collection/companions");
  const p = prompts.find((p) => p.id === "daily-check-in")!;
  await page.locator('.detail-link[data-detail="daily-check-in"]').click();
  await expect(
    page.getByRole("tab", { name: "完整提示词", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "语音开场白", exact: true }).click();
  await expect(page.locator(".spoken-script")).toBeVisible();
  await expect(page.locator(".spoken-script p")).toHaveText(
    p.spokenPrompt.split("\n"),
  );
  await page
    .getByRole("button", { name: "复制语音开场白", exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    p.spokenPrompt,
  );
  await page.getByRole("tab", { name: "完整提示词", exact: true }).click();
  await expect(page.locator("#prompt-text")).toHaveValue(p.prompt);
  await expect(
    page.getByRole("button", { name: "复制完整提示词", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator('.copy[data-copy="daily-check-in"]').click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    p.prompt,
  );
});
test("spoken manual-copy fallback keeps the selected text variant", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(Error("denied")) },
    }),
  );
  await page.goto("/#collection/interaction");
  await page.locator('.detail-link[data-detail="word-riddle"]').click();
  await page.getByRole("tab", { name: "语音开场白", exact: true }).click();
  await page
    .getByRole("button", { name: "复制语音开场白", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("手动复制");
  await expect(page.locator("#prompt-text")).toHaveValue(
    prompts.find((p) => p.id === "word-riddle")!.spokenPrompt,
  );
  await expect(page.locator("#prompt-text")).toBeFocused();
});
test("spoken view supports keyboard tabs and English mobile UI accessibly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/#collection/companions");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.locator('.detail-link[data-detail="focused-correction"]').click();
  await page.getByRole("tab", { name: "Full prompt", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Spoken opening", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("tab", { name: "Spoken opening", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  expect(
    await page.evaluate(
      () =>
        document.querySelector("dialog")!.scrollWidth <=
        document.querySelector("dialog")!.clientWidth,
    ),
  ).toBe(true);
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    scan.violations.map((v) => ({ id: v.id, count: v.nodes.length })),
  ).toEqual([]);
});
