import config from "../distribution/config.json" with { type: "json" };
import { test, expect } from "@playwright/test";
test("AI setup exposes distinct packages and honest MCP availability", async ({
  page,
}) => {
  await page.goto("/#settings");
  const setup = page.locator("#ai-setup");
  await expect(setup).toBeVisible();
  await setup.locator("summary").first().click();
  await expect(setup.locator("a[download]")).toHaveCount(3);
  await expect(setup.locator("textarea")).toHaveValue(
    /Install the TalkSprout skill/,
  );
  await setup.locator("summary").filter({ hasText: "MCP" }).click();
  if (config.mcpEndpoint) await expect(setup).toContainText(config.mcpEndpoint);
  else await expect(setup).toContainText(/尚未验证|No public endpoint/);
});

test("failed installation copy selects exact text for manual fallback", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
      configurable: true,
    }),
  );
  await page.goto("/#settings");
  const setup = page.locator("#ai-setup");
  await setup.getByRole("button", { name: "复制安装指令" }).click();
  const text = setup.locator("textarea");
  await expect(text).toBeFocused();
  const selection = await text.evaluate((el: HTMLTextAreaElement) =>
    el.value.slice(el.selectionStart, el.selectionEnd),
  );
  expect(selection).toBe(await text.inputValue());
  expect(selection.length).toBeGreaterThan(100);
});
