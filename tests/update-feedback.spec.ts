import { test, expect } from "@playwright/test";

declare global {
  interface Window {
    updateProbe: {
      messages: number;
      checks: number;
      failNext: boolean;
      activateSilently: () => void;
    };
  }
}
// Deterministic lifecycle simulation in standalone display mode, not a physical iPhone test.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("talksprout:locale", "zh");
    Object.defineProperty(navigator, "standalone", {
      configurable: true,
      value: true,
    });
    class Worker extends EventTarget {
      state: ServiceWorkerState = "installed";
      postMessage() {
        window.updateProbe.messages++;
        if (window.updateProbe.failNext) {
          window.updateProbe.failNext = false;
          throw Error("Worker suspended");
        }
      }
    }
    const old = new Worker();
    old.state = "activated";
    const next = new Worker();
    const applied = sessionStorage.getItem("test:update-applied") === "yes";
    if (applied) next.state = "activated";
    const registration = Object.assign(new EventTarget(), {
      waiting: applied ? null : next,
      active: applied ? next : old,
      installing: null,
      update: async () => {
        window.updateProbe.checks++;
        return registration;
      },
    });
    const container = Object.assign(new EventTarget(), {
      controller: applied ? next : old,
      register: async () => registration,
    });
    window.updateProbe = {
      messages: 0,
      checks: 0,
      failNext: false,
      activateSilently: () => {
        sessionStorage.setItem("test:update-applied", "yes");
        next.state = "activated";
        registration.active = next;
        registration.waiting = null;
      },
    };
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: container,
    });
    sessionStorage.setItem(
      "test:loads",
      String(Number(sessionStorage.getItem("test:loads") || 0) + 1),
    );
  });
});

test("standalone update responds immediately, times out visibly and can be retried", async ({
  page,
}) => {
  await page.goto("/#library");
  await expect(page.locator("#update")).toHaveText("立即更新");
  await page.clock.install();
  await page.locator("#update").click();
  await expect(page.locator("#update-bar")).toContainText("正在更新");
  await expect(page.locator("#update")).toBeDisabled();
  expect(await page.evaluate(() => window.updateProbe.messages)).toBe(1);
  await page.clock.fastForward(12001);
  await expect(page.locator("#update-bar")).toContainText("更新暂未完成");
  await expect(page.locator("#update-bar")).toContainText(
    "关闭 App 后重新打开",
  );
  await expect(page.locator("#update")).toHaveText("重试更新");
  await expect(page.locator("#update")).toBeEnabled();
  await page.locator("#update").click();
  await expect(page.locator("#update")).toBeDisabled();
  expect(await page.evaluate(() => window.updateProbe.messages)).toBe(2);
});

test("a suspended worker's send error has feedback instead of a silent dead button", async ({
  page,
}) => {
  await page.goto("/#library");
  await page.evaluate(() => {
    window.updateProbe.failNext = true;
  });
  await page.locator("#update").click();
  await expect(page.locator("#update-bar")).toContainText("更新暂未完成");
  await expect(page.locator("#update")).toBeEnabled();
  await page.locator("#update").click();
  await expect(page.locator("#update-bar")).toContainText("正在更新");
});

test("silent activation reloads once, preserves the route and acknowledges reopening", async ({
  page,
}) => {
  await page.goto("/#collection/companions");
  await expect(page.locator("#update")).toBeVisible();
  await page.clock.install();
  await page.locator("#update").click();
  await page.evaluate(() => window.updateProbe.activateSilently());
  await Promise.all([
    page.waitForEvent("framenavigated", (frame) => frame === page.mainFrame()),
    page.clock.fastForward(500),
  ]);
  await expect(page.locator("#library-heading")).toHaveText("日常陪练");
  await expect(page.locator("#update-bar")).toContainText("更新完成");
  expect(await page.evaluate(() => sessionStorage.getItem("test:loads"))).toBe(
    "2",
  );
  await expect(page.locator("#update")).toHaveCount(0);
});

test("mobile feedback fits narrow screens and announces progress accessibly", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/#library");
  await expect(page.locator("#update-bar")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
  await page.locator(".language-shortcut").click();
  await expect(page.locator("#update")).toHaveText("Update now");
  expect(
    (
      await new AxeBuilder({ page })
        .include("#update-bar")
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.locator("#update").click();
  await expect(page.locator("#update")).toHaveAttribute("aria-busy", "true");
  await expect(page.locator("#update-bar")).toHaveAttribute(
    "aria-live",
    "polite",
  );
});
