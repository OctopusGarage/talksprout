import config from "../distribution/config.json" with { type: "json" };
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
test("full edition downloads a self-contained Skill and direct chat attachment", async ({
  page,
}) => {
  await page.goto("/#ai");
  await page.getByRole("radio", { name: "完整版", exact: true }).check();
  await expect(
    page.getByRole("button", { name: "复制安装指令", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "下载完整版 Skill", exact: true }),
  ).toHaveAttribute(
    "href",
    new RegExp(config.packages.fullSkill.replaceAll(".", "\\.")),
  );
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "下载完整指令文件", exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("SKILL.md");
  expect(await readFile((await download.path())!, "utf8")).toBe(
    await readFile("distribution/full/talksprout/SKILL.md", "utf8"),
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("radio", { name: "轻量版", exact: true }).check();
  await expect(
    page.getByRole("button", { name: "复制安装指令", exact: true }),
  ).toBeVisible();
});
test("settings has one native entry; installation is a separate page with working Back", async ({
  page,
}) => {
  await page.goto("/#settings");
  await expect(page.locator("#ai-setup")).toHaveCount(0);
  await page.getByRole("button", { name: /在 AI 里直接用 TalkSprout/ }).click();
  await expect(page).toHaveURL(/#ai$/);
  await expect(page.locator(".ai-intro")).toContainText("在 AI 中直接练习");
  await expect(page.locator(".ai-intro")).toContainText("无需打开网页");
  await expect(
    page.getByRole("heading", { name: "在 AI 中练英语" }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: "安装 Skill" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("tab", { name: "上传插件" }).click();
  await expect(
    page.getByRole("link", { name: "下载插件包", exact: true }),
  ).toHaveAttribute(
    "href",
    new RegExp(config.packages.plugin.replaceAll(".", "\\.")),
  );
  await page.getByRole("radio", { name: "Claude", exact: true }).check();
  await expect(
    page.getByRole("link", { name: "下载插件包", exact: true }),
  ).toHaveAttribute(
    "href",
    new RegExp(config.packages.claudePlugin.replaceAll(".", "\\.")),
  );
  await page.getByRole("tab", { name: "连接 MCP" }).click();
  await expect(page.locator(".ai-endpoint")).toHaveText(config.mcpEndpoint);
  await page.getByRole("button", { name: "返回设置", exact: true }).click();
  await expect(page).toHaveURL(/#settings$/);
  await expect(page.locator("#ai-setup")).toHaveCount(0);
  await expect(page.locator("#ai-entry")).toBeFocused();
});
test("failed copy selects exact setup text for manual fallback", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
      configurable: true,
    }),
  );
  await page.goto("/#ai");
  await page.getByRole("button", { name: "复制安装指令", exact: true }).click();
  const text = page.getByRole("textbox", {
    name: "手动复制：复制安装指令",
    exact: true,
  });
  await expect(text).toBeFocused();
  expect(
    await text.evaluate((el: HTMLTextAreaElement) =>
      el.value.slice(el.selectionStart, el.selectionEnd),
    ),
  ).toBe(await text.inputValue());
});
test("AI page fits narrow and desktop layouts, supports keyboard tabs and English", async ({
  page,
}) => {
  await page.goto("/#ai");
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.getByRole("tab", { name: "安装 Skill" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "上传插件" })).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.goto("/#settings");
  await page.getByRole("radio", { name: "English", exact: true }).check();
  await page.goto("/#ai");
  await expect(
    page.getByRole("heading", { name: "English practice in your AI" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "Install Skill" }),
  ).toHaveAttribute("aria-selected", "true");
});
