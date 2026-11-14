import { test, expect, type Page, type Locator } from "@playwright/test";
import { prompts } from "../src/prompts";

const navigation = (page: Page) =>
  page.getByRole("navigation", { name: /^(主导航|Primary navigation)$/ });
const scrollRegion = (page: Page) => page.getByTestId("page-scroll");

async function box(locator: Locator) {
  const bounds = await locator.boundingBox();
  expect(bounds).not.toBeNull();
  return bounds!;
}

async function scrollToEnd(page: Page) {
  const region = scrollRegion(page);
  await region.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect
    .poll(() => region.evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0);
  return region.evaluate((element) => element.scrollTop);
}

async function expectScroll(page: Page, position: number) {
  await expect
    .poll(async () =>
      Math.abs(
        (await scrollRegion(page).evaluate((element) => element.scrollTop)) -
          position,
      ),
    )
    .toBeLessThanOrEqual(2);
}

test("phone shell stays bounded while only its page region scrolls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/#review");
  await expect(page.locator(".card")).toHaveCount(4);
  const headerBefore = await box(page.locator(".app-header"));
  const navBefore = await box(navigation(page));
  await scrollToEnd(page);
  const headerAfter = await box(page.locator(".app-header"));
  const navAfter = await box(navigation(page));
  expect(Math.abs(headerAfter.y - headerBefore.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(navAfter.y - navBefore.y)).toBeLessThanOrEqual(1);
  expect(navAfter.y + navAfter.height).toBeLessThanOrEqual(569);
  expect(navAfter.y).toBeGreaterThan(284);
  const region = await box(scrollRegion(page));
  expect(region.y).toBeGreaterThanOrEqual(
    headerAfter.y + headerAfter.height - 1,
  );
  expect(region.y + region.height).toBeLessThanOrEqual(navAfter.y + 1);
  expect(
    await page.evaluate(() => ({
      y: window.scrollY,
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    })),
  ).toEqual({ y: 0, width: 320, height: 568 });
  const shell = await box(page.locator(".app-shell"));
  expect(shell.y).toBeGreaterThanOrEqual(-1);
  expect(shell.height).toBeLessThanOrEqual(569);
});

test("tabs preserve independent search filters and scroll positions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/#review");
  const reviewScroll = await scrollToEnd(page);
  await navigation(page)
    .getByRole("link", { name: "开始练习", exact: true })
    .click();
  await expect(page).toHaveURL(/#library$/);
  await page.getByRole("searchbox").fill("coach");
  await expect(page.locator(".card")).toHaveCount(9);
  const libraryScroll = await scrollToEnd(page);
  await navigation(page)
    .getByRole("link", { name: "结束与复习", exact: true })
    .click();
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await expect(page.locator(".card")).toHaveCount(4);
  await expectScroll(page, reviewScroll);
  await navigation(page)
    .getByRole("link", { name: "开始练习", exact: true })
    .click();
  await expect(page.getByRole("searchbox")).toHaveValue("coach");
  await expectScroll(page, libraryScroll);
});

test("Back closes a routed sheet, restores focus and scroll, and footer copies exact text", async ({
  page,
  context,
  browserName,
}) => {
  if (browserName === "webkit") {
    // WebKit checks application-to-clipboard delivery through a capture stub.
    // Chromium covers the real clipboard with the same exact payload assertion.
    await page.addInitScript(() => {
      const capture = window as unknown as { shellClipboardText?: string };
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            capture.shellClipboardText = value;
          },
          readText: async () => capture.shellClipboardText ?? "",
        },
      });
    });
  } else {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  }
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/#collection/companions");
  const opener = page.locator('.detail-link[data-detail="daily-check-in"]');
  await opener.scrollIntoViewIfNeeded();
  const position = await scrollRegion(page).evaluate(
    (element) => element.scrollTop,
  );
  await opener.click();
  await expect(page).toHaveURL(/\?prompt=daily-check-in/);
  await expect(page.locator("#detail")).toBeVisible();
  const prompt = prompts.find((item) => item.id === "daily-check-in")!;
  await expect(page.locator("#prompt-text")).toHaveAttribute("readonly", "");
  await expect(page.locator("#prompt-text")).toHaveValue(prompt.prompt);
  const copy = page.locator("#detail .sheet-footer .modal-copy");
  const footerBefore = await box(page.locator("#detail .sheet-footer"));
  await page.locator("#detail .sheet-content").evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect
    .poll(() =>
      page
        .locator("#detail .sheet-content")
        .evaluate((element) => element.scrollTop),
    )
    .toBeGreaterThan(0);
  await expect(copy).toBeInViewport({ ratio: 1 });
  expect(
    Math.abs(
      (await box(page.locator("#detail .sheet-footer"))).y - footerBefore.y,
    ),
  ).toBeLessThanOrEqual(1);
  await copy.click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    prompt.prompt,
  );
  await page.goBack();
  await expect(page.locator("#detail")).toBeHidden();
  await expect(page).toHaveURL(/#collection\/companions$/);
  await expect(opener).toBeFocused();
  await expectScroll(page, position);
  await page.goto("/#collection/companions?prompt=daily-check-in");
  await expect(page.locator("#detail")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#detail")).toBeHidden();
  await expect(page).toHaveURL(/#collection\/companions$/);
  await expect(page.locator(".card")).toHaveCount(4);
});

test("settings language radios and header toggle stay bilingual without an external footer", async ({
  page,
}) => {
  await page.goto("/#library");
  await navigation(page)
    .getByRole("link", { name: "设置", exact: true })
    .click();
  await expect(page).toHaveURL(/#settings$/);
  await page.getByRole("radio", { name: "English", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("radio", { name: "English", exact: true }),
  ).toBeChecked();
  await expect(navigation(page)).toHaveAccessibleName("Primary navigation");
  await expect(navigation(page).locator('a[href="#settings"]')).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page
    .locator(".app-header")
    .getByRole("button", { name: "中文", exact: true })
    .click();
  await expect(
    page.getByRole("radio", { name: "中文", exact: true }),
  ).toBeChecked();
  await expect(navigation(page)).toHaveAccessibleName("主导航");
  await page
    .locator(".app-header")
    .getByRole("button", { name: "English", exact: true })
    .click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("radio", { name: "English", exact: true }),
  ).toBeChecked();
  await expect(
    page.locator('footer a[href^="http"], footer a[target="_blank"]'),
  ).toHaveCount(0);
});

test("visualViewport keyboard shrinks the shell and hides mobile nav only for editable focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const viewport = window.visualViewport;
    if (!viewport) throw new Error("visualViewport is required for this test");
    let height = 844;
    Object.defineProperty(viewport, "height", {
      configurable: true,
      get: () => height,
    });
    Object.defineProperty(window, "setTestViewportHeight", {
      value: (value: number) => {
        height = value;
        viewport.dispatchEvent(new Event("resize"));
      },
    });
  });
  const resize = async (height: number) =>
    page.evaluate((value) => {
      (
        window as unknown as { setTestViewportHeight: (height: number) => void }
      ).setTestViewportHeight(value);
    }, height);
  await page.goto("/#collection/companions");
  const search = page.getByRole("searchbox");
  await search.focus();
  await resize(480);
  await expect
    .poll(async () => (await box(page.locator(".app-shell"))).height)
    .toBeLessThanOrEqual(481);
  await expect(navigation(page)).toBeHidden();
  await search.evaluate((element) => (element as HTMLElement).blur());
  await resize(844);
  await expect(navigation(page)).toBeVisible();
  await page.locator('.detail-link[data-detail="daily-check-in"]').click();
  await page.locator("#prompt-text").focus();
  await resize(480);
  // A modal can make the background inert; inspect actual nav layout rather than its accessibility exposure.
  await expect(page.locator(".app-nav")).toBeVisible();
  await resize(844);
  await page.keyboard.press("Escape");
  await expect(navigation(page)).toBeVisible();
});

test("landscape and desktop navigation fit the viewport under reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#review");
  for (const viewport of [
    { width: 760, height: 360 },
    { width: 761, height: 568 },
    { width: 1280, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(navigation(page)).toBeVisible();
    const nav = await box(navigation(page));
    const region = await box(scrollRegion(page));
    if (viewport.width >= 761) {
      expect(nav.x + nav.width).toBeLessThanOrEqual(region.x + 1);
    } else {
      expect(nav.y).toBeGreaterThanOrEqual(region.y + region.height - 1);
    }
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight + 1,
      ),
    ).toBe(true);
    await navigation(page)
      .getByRole("link", { name: "设置", exact: true })
      .click();
    await expect(page).toHaveURL(/#settings$/);
    await navigation(page)
      .getByRole("link", { name: "结束与复习", exact: true })
      .click();
    await expect(page.locator(".card")).toHaveCount(4);
    await expect
      .poll(() =>
        page
          .locator(".workspace:visible")
          .evaluate((element) => getComputedStyle(element).animationName),
      )
      .toBe("none");
  }
});

test("settings info panels support Back, Escape, focus return and direct-link dismissal", async ({
  page,
}) => {
  await page.goto("/#settings");
  const header = page.locator(".app-header");
  const about = page.locator("#about");
  await about.click();
  await expect(page).toHaveURL(/#settings\?info=about$/);
  await expect(page.locator("#detail")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveAccessibleName("使用说明");
  await page.goBack();
  await expect(page).toHaveURL(/#settings$/);
  await expect(page.locator("#detail")).toBeHidden();
  await expect(about).toBeFocused();
  await expect(
    header.getByRole("heading", { name: "设置", exact: true }),
  ).toBeVisible();

  await page.locator("#install").click();
  await expect(page).toHaveURL(/#settings\?info=install$/);
  await expect(page.getByRole("dialog")).toHaveAccessibleName(
    "把开口芽放进口袋",
  );
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/#settings$/);
  await expect(page.locator("#detail")).toBeHidden();
  await expect(page.locator("#install")).toBeFocused();

  await page.goto("/#settings?info=about");
  const origin = new URL(page.url()).origin;
  await expect(page.getByRole("dialog")).toHaveAccessibleName("使用说明");
  await page.locator("#detail .modal-close").click();
  await expect(page).toHaveURL(/#settings$/);
  expect(new URL(page.url()).origin).toBe(origin);
  await expect(page.locator("#detail")).toBeHidden();
  await expect(
    header.getByRole("heading", { name: "设置", exact: true }),
  ).toBeVisible();
  await expect(about).toBeVisible();
});

test("collection search stays scoped and native history preserves each base filter", async ({
  page,
}) => {
  await page.goto("/#library");
  await expect(page.locator(".collection-card")).toHaveCount(3);
  await page.locator('[data-collection="companions"]').click();
  await expect(page).toHaveURL(/#collection\/companions$/);
  await page.getByRole("searchbox").fill("coffee");
  // The role-play coach matches coffee, but belongs to another collection.
  await expect(page.locator(".card")).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(/#library$/);
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await expect(page.locator(".collection-card")).toHaveCount(3);
  await page.goForward();
  await expect(page).toHaveURL(/#collection\/companions$/);
  await expect(page.getByRole("searchbox")).toHaveValue("coffee");
  await expect(page.locator(".card")).toHaveCount(0);
  await page.getByRole("button", { name: "清除筛选", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await expect(page.locator(".card")).toHaveCount(4);
  await page.goBack();
  await expect(page).toHaveURL(/#library$/);
  await page.getByRole("searchbox").fill("coffee");
  await expect(
    page.locator('.detail-link[data-detail="roleplay-coach"]'),
  ).toBeVisible();
});

test("zoomed keyboard detection cleans up on blur and rotation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const viewport = window.visualViewport;
    if (!viewport) throw new Error("visualViewport is required for this test");
    let height = 844;
    let scale = 1;
    Object.defineProperty(viewport, "height", {
      configurable: true,
      get: () => height,
    });
    Object.defineProperty(viewport, "scale", {
      configurable: true,
      get: () => scale,
    });
    Object.defineProperty(window, "setTestZoomViewport", {
      value: (next: { height: number; scale: number }) => {
        height = next.height;
        scale = next.scale;
        viewport.dispatchEvent(new Event("resize"));
      },
    });
  });
  const resize = async (height: number, scale: number) =>
    page.evaluate(
      (next) => {
        (
          window as unknown as {
            setTestZoomViewport: (value: {
              height: number;
              scale: number;
            }) => void;
          }
        ).setTestZoomViewport(next);
      },
      { height, scale },
    );
  await page.goto("/#collection/companions");
  const search = page.getByRole("searchbox");
  await search.focus();
  await resize(480, 1);
  await expect(page.locator(".app-shell")).toHaveClass(/keyboard-open/);
  await expect(page.locator(".app-nav")).toBeHidden();
  await resize(240, 2);
  await expect(page.locator(".app-shell")).toHaveClass(/keyboard-open/);
  await expect(page.locator(".app-nav")).toBeHidden();
  await search.evaluate((element) => (element as HTMLElement).blur());
  await resize(422, 2);
  await expect(page.locator(".app-shell")).not.toHaveClass(/keyboard-open/);
  await expect(page.locator(".app-nav")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--app-height")
          .trim(),
      ),
    )
    .toBe("844px");
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--app-top")
          .trim(),
      ),
    )
    .toBe("0px");
  await page.setViewportSize({ width: 844, height: 390 });
  await resize(195, 2);
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--app-height")
          .trim(),
      ),
    )
    .toBe("390px");
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--app-top")
          .trim(),
      ),
    )
    .toBe("0px");
  await expect(page.locator(".app-nav")).toBeVisible();
  expect((await box(page.locator(".app-shell"))).height).toBeLessThanOrEqual(
    391,
  );
});

test("touch dismissal restores focus without a row outline and keyboard focus stays visible", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
    locale: "zh-CN",
  });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/#collection/companions`);
    const opener = page.locator('[data-detail="focused-correction"]');
    await page.keyboard.press("Tab");
    await opener.focus();
    await opener.tap();
    await expect(page.locator("#detail")).toBeVisible();
    await page.locator("#prompt-text").tap();
    await page.goBack();
    await expect(page.locator("#detail")).toBeHidden();
    await expect(opener).toBeFocused();
    await expect(opener).toHaveCSS("outline-style", "none");
    await page.keyboard.press("Tab");
    await opener.focus();
    await expect(opener).toBeFocused();
    await expect(opener).toHaveCSS("outline-style", "solid");
    await opener.dispatchEvent("pointerdown", { pointerType: "touch" });
    await expect(opener).toHaveCSS("outline-style", "none");
    // Exercise stale browser focus heuristics while switching input methods.
    for (const selector of [
      '[data-favorite="focused-correction"]',
      '[data-copy="focused-correction"]',
      "#favorites",
      '.app-nav a[href="#review"]',
      '.app-nav a[href="#settings"]',
    ]) {
      const control = page.locator(selector);
      await page.keyboard.press("Tab");
      await control.focus();
      await expect(control).toHaveCSS("outline-style", "solid");
      await control.dispatchEvent("pointerdown", { pointerType: "touch" });
      await expect(control).toHaveCSS("outline-style", "none");
    }
    await page.getByRole("searchbox").tap();
    await expect(page.getByRole("searchbox")).toBeFocused();
    await expect(page.locator(".search")).toHaveCSS("outline-style", "solid");
    await page.locator('.app-nav a[href="#settings"]').tap();
    const english = page.getByRole("radio", { name: "English", exact: true });
    const label = page
      .locator(".language-options label")
      .filter({ has: english });
    await page.keyboard.press("Tab");
    await english.focus();
    await expect(label).toHaveCSS("outline-style", "solid");
    await label.tap();
    await expect(english).toBeChecked();
    await expect(label).toHaveCSS("outline-style", "none");
    await page.locator("#about").tap();
    await expect(page.locator("#detail")).toBeVisible();
    await page.locator(".modal-close").tap();
    await expect(page.locator("#about")).toBeFocused();
    await expect(page.locator("#about")).toHaveCSS("outline-style", "none");
  } finally {
    await context.close();
  }
});

// Synthetic touch payloads exercise app gesture handling, not iOS system gestures.
async function swipeFromRight(
  page: Page,
  options: { startX?: number; dx?: number; moveDx?: number; dy?: number; cancel?: boolean; multi?: boolean; selector?: string } = {},
) {
  await page.evaluate((options) => {
    const x = options.startX ?? innerWidth - 8;
    const y = 240;
    const target = options.selector
      ? document.querySelector(options.selector)!
      : document.elementFromPoint(x, y)!;
    const point = (clientX: number, clientY: number, identifier = 1) =>
      ({ identifier, target, clientX, clientY });
    const start = point(x, y);
    const end = point(x + (options.dx ?? -100), y + (options.dy ?? 0));
    type Point = ReturnType<typeof point>;
    const emit = (type: string, touches: Point[], changedTouches: Point[]) => {
      // Desktop WebKit exposes Touch but disallows its constructor.
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperties(event, {
        touches: { value: touches },
        changedTouches: { value: changedTouches },
      });
      target.dispatchEvent(event);
    };
    emit("touchstart", [start], [start]);
    if (options.multi) emit("touchstart", [start, point(x - 20, y, 2)], [point(x - 20, y, 2)]);
    const moved = point(x + (options.moveDx ?? options.dx ?? -100), y + (options.dy ?? 0));
    emit("touchmove", [moved], [moved]);
    emit(options.cancel ? "touchcancel" : "touchend", [], [end]);
  }, options);
}

test("right-edge left swipe closes details and returns collections without leaving the app", async ({ page }) => {
  await page.goto("/#collection/companions");
  await page.locator('[data-detail="daily-check-in"]').click();
  await swipeFromRight(page);
  await expect(page.locator("#detail")).toBeHidden();
  await expect(page).toHaveURL(/#collection\/companions$/);
  await swipeFromRight(page);
  await expect(page).toHaveURL(/#library$/);
  await swipeFromRight(page);
  await expect(page).toHaveURL(/#library$/);

  await page.goto("/#settings?info=about");
  await swipeFromRight(page);
  await expect(page.locator("#detail")).toBeHidden();
  await expect(page).toHaveURL(/#settings$/);
  await page.goto("/#collection/companions?prompt=daily-check-in");
  await swipeFromRight(page);
  await expect(page.locator("#detail")).toBeHidden();
  await expect(page).toHaveURL(/#collection\/companions$/);
});

test("right-edge back ignores scrolling, short, reversed, cancelled, multi-touch and text gestures", async ({ page }) => {
  await page.goto("/#collection/companions?prompt=daily-check-in");
  for (const options of [
    { dy: 140 }, { dx: -30 }, { moveDx: -100, dx: -20 }, { startX: 200 }, { dx: 100 },
    { cancel: true }, { multi: true }, { selector: "#prompt-text" },
  ]) {
    await swipeFromRight(page, options);
    await expect(page.locator("#detail")).toBeVisible();
  }
  await page.evaluate(() => {
    const range = document.createRange();
    range.selectNodeContents(document.getElementById("dialog-title")!);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
  });
  await swipeFromRight(page);
  await expect(page.locator("#detail")).toBeVisible();
  await page.evaluate(() => window.getSelection()!.removeAllRanges());
  await swipeFromRight(page);
  await expect(page.locator("#detail")).toBeHidden();
});

test("right-edge back dismisses the scenario browser before its parent prompt", async ({ page }) => {
  await page.goto("/#collection/companions");
  await page.locator('[data-detail="daily-check-in"]').click();
  await page.locator(".scene-trigger").click();
  await page.locator("#scene-search").fill("篮球");
  await page.getByRole("button", { name: "篮球", exact: true }).click();
  await page.locator(".scene-settings > summary").click();
  await page.getByLabel("补充背景（可选）").fill("I play on weekends.");
  await page.locator(".scene-trigger").click();
  await expect(page.locator(".scene-browser")).toBeVisible();
  await swipeFromRight(page);
  await expect(page.locator(".scene-browser")).toHaveCount(0);
  await expect(page.locator("#detail")).toBeVisible();
  await expect(page).toHaveURL(/#collection\/companions\?prompt=daily-check-in&scene=basketball$/);
  await expect(page.locator("#prompt-text")).toContainText("Basketball");
  await expect(page.getByLabel("补充背景（可选）")).toHaveValue("I play on weekends.");
  await swipeFromRight(page);
  await expect(page.locator("#detail")).toBeHidden();
  await expect(page).toHaveURL(/#collection\/companions$/);
});
