import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { reviewPrompts } from "../src/prompts";
import { promptText } from "../src/prompt-text";

test("start and wrap-up stay separate through search, favorites, Back and reload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".collection-card")).toHaveCount(3);
  await page.getByRole("link", { name: "结束与复习", exact: true }).click();
  await expect(page).toHaveURL(/#review$/);
  await page.locator(".skip").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#library-heading")).toBeFocused();
  await expect(page).toHaveURL(/#review$/);
  await expect(page.locator(".card")).toHaveCount(4);
  await expect(page.locator(".recommended")).toHaveText("推荐");
  await page.locator('[data-favorite="complete-study-notes"]').click();
  await page.getByRole("searchbox").fill("roleplay");
  await expect(page.locator(".card")).toHaveCount(0);
  await page.getByRole("link", { name: "开始练习", exact: true }).click();
  await page.locator("#favorites").click();
  await expect(page.locator(".card")).toHaveCount(0);
  await page.goBack();
  await expect(page.getByRole("searchbox")).toHaveValue("roleplay");
  await expect(page.locator(".card")).toHaveCount(0);
  await page.getByRole("button", { name: "清除筛选", exact: true }).click();
  await expect(page.locator(".card")).toHaveCount(4);
  await page.reload();
  await expect(
    page.getByRole("link", { name: "结束与复习", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.locator("#favorites").click();
  await expect(page.locator(".card")).toHaveCount(1);
  await page.getByRole("searchbox").fill("语法");
  await expect(page.locator(".card")).toHaveCount(0);
  await page
    .getByRole("button", { name: "清除筛选", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/#review$/);
  await expect(page.locator(".card")).toHaveCount(4);
});

test("every review copies exact current, transcript and spoken content with source reset", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#review");
  for (const p of reviewPrompts) {
    await page.locator(`.detail-link[data-detail="${p.id}"]`).click();
    await expect(page.locator(".chat-tips")).toHaveCount(0);
    await expect(page.locator(".modal-facts")).not.toContainText("分钟");
    await expect(page.locator("#review-source")).toHaveValue("current");
    await expect(page.locator("#prompt-text")).toHaveValue(p.prompt);
    await page.locator(".modal-copy").click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      p.prompt,
    );
    await page.locator("#review-source").selectOption("transcript");
    await expect(page.locator(".modal-copy")).toHaveText("复制完整提示词");
    await page.locator(".modal-copy").click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      promptText(p, "full", "transcript"),
    );
    await page.getByRole("tab", { name: "语音结尾提示", exact: true }).click();
    await expect(page.locator("#review-source")).toHaveCount(0);
    await expect(page.locator(".spoken-script p")).toHaveText(
      p.spokenPrompt.split("\n"),
    );
    await page.locator(".modal-copy").click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      p.spokenPrompt,
    );
    await page.keyboard.press("Escape");
    await page.locator(`.copy[data-copy="${p.id}"]`).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      p.prompt,
    );
  }
});

test("failed transcript copying preserves source and selects the full template", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(Error("denied")) },
    }),
  );
  await page.goto("/#review");
  await page
    .locator('.detail-link[data-detail="complete-study-notes"]')
    .click();
  await page.locator("#review-source").selectOption("transcript");
  await page.locator(".modal-copy").click();
  await expect(page.getByRole("alert")).toContainText("手动复制");
  await expect(page.locator("#review-source")).toHaveValue("transcript");
  await expect(page.locator("#prompt-text")).toHaveValue(
    promptText(reviewPrompts[0], "full", "transcript"),
  );
  await expect(page.locator("#prompt-text")).toBeFocused();
  const selection = await page
    .locator("#prompt-text")
    .evaluate((e: HTMLTextAreaElement) => [
      e.selectionStart,
      e.selectionEnd,
      e.value.length,
    ]);
  expect(selection).toEqual([0, selection[2], selection[2]]);
});

test("review works offline and keeps separate favorites", async ({
  page,
  context,
}) => {
  await page.goto("/#review");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise((resolve) =>
        navigator.serviceWorker.addEventListener("controllerchange", resolve, {
          once: true,
        }),
      );
  });
  await page.locator('[data-favorite="review-cards"]').click();
  // A Web Lock may complete after the click; wait for the persisted selection.
  await expect(page.locator('[data-favorite="review-cards"]')).toHaveAttribute("aria-pressed", "true");
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".card")).toHaveCount(4);
  await page.locator("#favorites").click();
  await expect(page.locator(".card")).toHaveCount(1);
  await page.locator('.detail-link[data-detail="review-cards"]').click();
  await expect(page.locator("#prompt-text")).toHaveValue(
    reviewPrompts[3].prompt,
  );
});

test("bilingual review pages and both formats fit phones and have no detected AA issues", async ({
  page,
}) => {
  await page.goto("/#review");
  for (const language of ["zh", "en"]) {
    if (language === "en")
      await page.getByRole("button", { name: "English", exact: true }).click();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 320, height: 740 });
    for (const state of ["list", "full", "spoken"]) {
      if (state === "full") {
        await page
          .locator('.detail-link[data-detail="vocabulary-ipa-review"]')
          .click();
        await page.locator("#review-source").selectOption("transcript");
      }
      if (state === "spoken") {
        await page
          .getByRole("tab", {
            name: language === "zh" ? "完整提示词" : "Full prompt",
            exact: true,
          })
          .focus();
        await page.keyboard.press("End");
        await expect(
          page.getByRole("tab", {
            name: language === "zh" ? "语音结尾提示" : "Spoken wrap-up",
            exact: true,
          }),
        ).toBeFocused();
      }
      if (state !== "list")
        expect(
          await page
            .locator("dialog")
            .evaluate((e) => e.scrollWidth <= e.clientWidth),
        ).toBe(true);
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        scan.violations.map((v) => ({ id: v.id, nodes: v.nodes.length })),
        `${language} ${state}`,
      ).toEqual([]);
    }
    await page.keyboard.press("Escape");
  }
});
