import { test, expect } from "@playwright/test";
import { socialPrompts } from "../src/content/social";
import { promptText } from "../src/prompt-text";

test("new reciprocal modes copy both complete formats without scenario interrogation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("talksprout:locale", "zh");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { socialCopy: string }).socialCopy = text;
        },
      },
    });
  });
  for (const p of socialPrompts) {
    await page.goto(`/#library?prompt=${p.id}`);
    await expect(page.locator("#prompt-text")).toHaveText(
      promptText(p, "full", "current", "zh"),
    );
    await expect(page.locator(".scene-trigger")).toHaveCount(0);
    await page
      .getByRole("button", { name: "复制完整提示词", exact: true })
      .click();
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { socialCopy: string }).socialCopy,
        ),
      )
      .toBe(promptText(p, "full", "current", "zh"));
    await page.getByRole("tab", { name: "语音开场白", exact: true }).click();
    await page
      .getByRole("button", { name: "复制语音开场白", exact: true })
      .click();
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { socialCopy: string }).socialCopy,
        ),
      )
      .toBe(promptText(p, "spoken", "current", "zh"));
  }
});
