import { test, expect, type Page } from "@playwright/test";

async function browse(page: Page) {
  await page.locator(".scene-trigger").click();
  await expect(page.locator(".scene-browser")).toBeVisible();
}
async function choose(page: Page, name: string) {
  await browse(page);
  await page.locator("#scene-search").fill(name);
  await page.getByRole("button", { name, exact: true }).click();
  await expect(page.locator(".scene-browser")).toHaveCount(0);
}
async function settings(page: Page) {
  await page.locator(".scene-settings > summary").click();
}
async function clear(page: Page, name = "不指定场景") {
  await browse(page);
  await page.getByRole("button", { name, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("talksprout:locale"))
      localStorage.setItem("talksprout:locale", "zh");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { sceneCopy: string }).sceneCopy = text;
        },
      },
    });
  });
});
test("scene selection replaces setup, edits full background and copies the exact displayed payload", async ({
  page,
}) => {
  await page.goto("/#library?prompt=roleplay-coach");
  await choose(page, "篮球");
  const preview = page.locator("#prompt-text");
  await expect(preview).toContainText("Basketball");
  await expect(preview).not.toContainText("First ask which situation");
  await settings(page);
  await page.getByLabel("补充背景（可选）").fill("I play on weekends.");
  await expect(preview).toContainText("I play on weekends.");
  await page
    .getByRole("button", { name: "复制完整提示词", exact: true })
    .click();
  expect(
    await page.evaluate(
      () => (window as unknown as { sceneCopy: string }).sceneCopy,
    ),
  ).toBe(await preview.inputValue());
  await choose(page, "网球");
  await expect(page.getByLabel("补充背景（可选）")).not.toBeVisible();
  await settings(page);
  await expect(page.getByLabel("补充背景（可选）")).toHaveValue("");
  await expect(preview).toContainText("Tennis");
  await expect(preview).not.toContainText("Basketball");
  await page.getByRole("tab", { name: "语音开场白", exact: true }).click();
  await expect(page.locator(".spoken-script")).toContainText("tennis");
  await page
    .getByRole("button", { name: "复制语音开场白", exact: true })
    .click();
  expect(
    await page.evaluate(
      () => (window as unknown as { sceneCopy: string }).sceneCopy,
    ),
  ).toContain("Practice tennis.");
  await clear(page);
  await expect(page.locator(".spoken-script")).toContainText(
    "Ask which situation I want",
  );
});
test("search reaches technical scenes and mock pacing; review and material sheets stay isolated", async ({
  page,
}) => {
  await page.goto("/#library?prompt=roleplay-coach");
  await choose(page, "竞态与原子性");
  await settings(page);
  await page.getByRole("button", { name: "模拟面试", exact: true }).click();
  await expect(page.locator("#prompt-text")).toContainText(
    "Save feedback until",
  );
  await page.getByRole("tab", { name: "语音开场白", exact: true }).click();
  await expect(page.locator(".spoken-script")).toContainText(
    "save language and technical feedback",
  );
  await page.keyboard.press("Escape");
  await page.goto("/#library?prompt=visual-vocabulary");
  await expect(page.locator(".scenario-picker")).toHaveCount(0);
  await page.goto("/#review?prompt=complete-study-notes");
  await expect(page.locator(".scenario-picker")).toHaveCount(0);
});
test("English labels follow saved language; keyboard can select and clear a preset", async ({
  page,
}) => {
  await page.goto("/#library?prompt=daily-check-in");
  await browse(page);
  await page.locator("#scene-search").fill("篮球");
  await page.getByRole("button", { name: "篮球", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#prompt-text")).toContainText("Basketball");
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/#library$/);
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "中文", exact: true }),
  ).toBeVisible();
  await page.goto("/#library?prompt=daily-check-in");
  await expect(
    page.getByRole("button", {
      name: "Practice scenario：No preset",
      exact: true,
    }),
  ).toBeVisible();
  await choose(page, "Basketball");
  await clear(page, "No preset");
  await expect(page.locator("#prompt-text")).not.toContainText(
    "SELECTED PRACTICE SCENARIO",
  );
});

test("clipboard rejection selects the exact customized payload and stale completion cannot restore old feedback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const callbacks: { resolve: () => void; reject: () => void }[] = [];
    Object.assign(window, { sceneClipboard: callbacks });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (text: string) => {
          (window as unknown as { sceneCopy: string }).sceneCopy = text;
          return new Promise<void>((resolve, reject) =>
            callbacks.push({ resolve, reject: () => reject(Error("denied")) }),
          );
        },
      },
    });
  });
  await page.goto("/#library?prompt=roleplay-coach");
  await choose(page, "篮球");
  await settings(page);
  await page.getByLabel("补充背景（可选）").fill("I play on Sundays.");
  const expected = await page.locator("#prompt-text").inputValue();
  await page
    .getByRole("button", { name: "复制完整提示词", exact: true })
    .click();
  await page.evaluate(() =>
    (
      window as unknown as { sceneClipboard: { reject: () => void }[] }
    ).sceneClipboard[0].reject(),
  );
  await expect(page.locator("#prompt-text")).toBeFocused();
  expect(
    await page
      .locator("#prompt-text")
      .evaluate((e: HTMLTextAreaElement) =>
        e.value.slice(e.selectionStart, e.selectionEnd),
      ),
  ).toBe(expected);
  await choose(page, "网球");
  await page
    .getByRole("button", { name: "复制完整提示词", exact: true })
    .click();
  await choose(page, "篮球");
  await page.evaluate(() =>
    (
      window as unknown as { sceneClipboard: { reject: () => void }[] }
    ).sceneClipboard[1].reject(),
  );
  await expect(page.locator("#prompt-text")).toContainText("Basketball");
  await expect(
    page.getByRole("button", { name: "复制完整提示词", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".manual-note")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.goto("/#library?prompt=daily-check-in");
  await expect(page.locator("#scene-background")).toHaveCount(0);
});

test("scenario controls fit narrow screens and meet automated accessibility checks", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/#library?prompt=roleplay-coach");
  await browse(page);
  await page
    .getByRole("button", { name: "程序员英文面试", exact: true })
    .click();
  await page
    .getByRole("button", { name: "AI Agent 工程", exact: true })
    .click();
  await page
    .getByRole("button", { name: "工具调用与权限", exact: true })
    .click();
  await settings(page);
  const violations = (
    await new AxeBuilder({ page })
      .include("#detail")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()
  ).violations;
  expect(violations).toEqual([]);
  expect(
    await page
      .locator("#detail")
      .evaluate((e) => e.scrollWidth <= e.clientWidth),
  ).toBe(true);
  await expect(page.locator(".sheet-footer .modal-copy")).toBeInViewport();
});

test("scenario defaults to no preset and browsing never selects or changes the prompt", async ({
  page,
}) => {
  await page.goto("/#library?prompt=roleplay-coach");
  const original = await page.locator("#prompt-text").inputValue();
  await expect(
    page.getByRole("button", { name: "练习场景：不指定场景", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#scene-search")).not.toBeVisible();
  await page
    .getByRole("button", { name: "练习场景：不指定场景", exact: true })
    .click();
  await expect(
    page.locator(".scene-browser button[aria-pressed=true]"),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "生活与兴趣", exact: true }).click();
  await page.getByRole("button", { name: "球类运动", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "练习场景：不指定场景", exact: true }),
  ).toBeFocused();
  await expect(page.locator("#prompt-text")).toHaveValue(original);
  await page
    .getByRole("button", { name: "练习场景：不指定场景", exact: true })
    .click();
  await page.goBack();
  await expect(page.locator(".scene-browser")).not.toBeVisible();
  await expect(page.locator("#detail")).toBeVisible();
  await page.goForward();
  await expect(page.locator(".scene-browser")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".scene-browser")).toHaveCount(0);
  await expect(page.locator("#detail")).toBeVisible();
});

test("picker keeps focus inside its sheet, uses green keyboard focus and restores touch focus without a ring", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.goto("/#library?prompt=roleplay-coach");
  await page.locator(".scene-trigger").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".scene-browser")).toBeVisible();
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveCSS("outline-color", "rgb(40, 90, 70)");
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page
        .locator(":focus")
        .evaluate((e) => !!e.closest(".scene-browser")),
    ).toBe(true);
  }
  expect(
    (
      await new AxeBuilder({ page })
        .include(".scene-browser")
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "完成", exact: true }).click();
  await expect(page.locator(".scene-trigger")).toBeFocused();
  await expect(page.locator(".scene-trigger")).toHaveCSS(
    "outline-style",
    "none",
  );
  await expect(page.locator(".scene-trigger")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("five scene categories expose services and migrated travel with exact preview and clipboard", async ({ page }) => {
  await page.goto("/#library?prompt=roleplay-coach");
  await browse(page);
  await expect(page.locator(".scene-list > .scene-row:not(.scene-none)")).toHaveCount(5);
  await page.getByRole("button", { name: "日常办事与服务", exact: true }).click();
  await page.getByRole("button", { name: "购物与售后", exact: true }).click();
  await page.getByRole("button", { name: "退换商品", exact: true }).click();
  await expect(page.locator("#prompt-text")).toContainText("Returning an item");
  await page.getByRole("button", { name: "复制完整提示词", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { sceneCopy: string }).sceneCopy))
    .toBe(await page.locator("#prompt-text").inputValue());
  await choose(page, "行李未到");
  await expect(page.locator("#prompt-text")).toContainText("Missing baggage");
  await choose(page, "婉拒邀请");
  await expect(page.locator("#prompt-text")).toContainText("Declining an invitation");
});

test("travel topic support survives migration and unavailable topic groups stay hidden", async ({ page }) => {
  for (const coach of ["friendly-debate", "word-riddle"]) {
    await page.goto(`/#library?prompt=${coach}`);
    await browse(page);
    await expect(page.getByRole("button", { name: "日常办事与服务", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "旅行与出行", exact: true }).click();
    await expect(page.getByRole("button", { name: "旅途问题处理", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "旅途沟通", exact: true }).click();
    await page.getByRole("button", { name: "酒店入住", exact: true }).click();
    await expect(page.locator("#prompt-text")).toContainText("Hotel check-in");
    await expect(page.locator("#prompt-text")).toContainText(coach === "friendly-debate" ? "opinion discussion" : "vocabulary theme");
  }
});

test("new categories and bilingual search follow the persisted English locale on narrow phones", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/#library?prompt=roleplay-coach");
  await page.evaluate(() => localStorage.setItem("talksprout:locale", "en"));
  await page.reload();
  await browse(page);
  await expect(page.getByRole("button", { name: "Travel & Getting Around", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Everyday Services", exact: true }).click();
  await page.locator("#scene-search").fill("退换商品");
  await page.getByRole("button", { name: "Returning an item", exact: true }).click();
  await page.getByRole("tab", { name: "Spoken opening", exact: true }).click();
  await expect(page.locator(".spoken-script")).toContainText("returning an item");
  expect(await page.locator("#detail").evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(true);
  await page.reload();
  await expect(page.locator(".scene-trigger")).toContainText("Returning an item");
  await browse(page);
  // Reload now restores the selected scene and opens its group, not the category root.
  await expect(page.getByRole("button", { name: "Returning an item", exact: true })).toBeVisible();
});
