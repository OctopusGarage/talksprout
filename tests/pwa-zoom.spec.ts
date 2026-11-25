import { test, expect } from "@playwright/test";
for (const installed of [false, true])
  test(`zoom guard installed=${installed}`, async ({ page }) => {
    if (installed)
      await page.addInitScript(() =>
        Object.defineProperty(navigator, "standalone", {
          value: true,
          configurable: true,
        }),
      );
    await page.goto("/");
    await expect(page.locator("#app")).not.toBeEmpty();
    if (installed)
      await expect(page.locator("html")).toHaveAttribute(
        "data-installed-app",
        "",
      );
    const result = await page.evaluate(() => {
      const send = (type: string, touches?: number, ctrlKey?: boolean) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        if (touches !== undefined)
          Object.defineProperty(event, "touches", {
            value: { length: touches },
          });
        if (ctrlKey !== undefined)
          Object.defineProperty(event, "ctrlKey", { value: ctrlKey });
        document.dispatchEvent(event);
        return event.defaultPrevented;
      };
      const key = new KeyboardEvent("keydown", {
        key: "-",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(key);
      return {
        keyboard: key.defaultPrevented,
        pinch: send("touchmove", 2),
        scroll: send("touchmove", 1),
        gesture: send("gesturestart"),
        trackpad: send("wheel", undefined, true),
        wheel: send("wheel", undefined, false),
        touchAction: getComputedStyle(document.documentElement).touchAction,
      };
    });
    expect(result.keyboard).toBe(installed);
    expect(result.pinch).toBe(installed);
    expect(result.gesture).toBe(installed);
    expect(result.trackpad).toBe(installed);
    expect(result.scroll).toBe(false);
    expect(result.wheel).toBe(false);
    if (installed) expect(result.touchAction).toBe("pan-x pan-y");
  });

test("ordinary browser fullscreen keeps browser zoom", async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = (query: string) => {
      const result = original(query);
      if (query === "(display-mode: fullscreen)")
        Object.defineProperty(result, "matches", { value: true });
      return result;
    };
  });
  await page.goto("/");
  await expect(page.locator("#app")).not.toBeEmpty();
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-installed-app",
    "",
  );
  expect(
    await page.evaluate(() => {
      const event = new WheelEvent("wheel", {
        ctrlKey: true,
        cancelable: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
      return event.defaultPrevented;
    }),
  ).toBe(false);
});
