import { test, expect } from "@playwright/test";

const savedItems = ["daily-check-in", "gentle-start", "focused-correction", "expression-upgrade"].map(promptId => ({
  promptId,
  variant: "full",
  pace: "coached",
}));

for (const locale of ["zh", "en"] as const) {
  test(`${locale}: saved combinations start bounded, expand by keyboard and preserve removals`, async ({ page }) => {
    await page.addInitScript(({ items, language }) => {
      if (!localStorage.getItem("quick-access-test-seeded")) {
        localStorage.setItem("talksprout:practice-shortcuts", JSON.stringify(items));
        localStorage.setItem("talksprout:locale", language);
        localStorage.setItem("quick-access-test-seeded", "true");
      }
    }, { items: savedItems, language: locale });
    await page.goto("/");
    const region = page.getByRole("region", { name: locale === "en" ? "Saved practice combinations" : "常用练习组合" });
    await expect(region.locator(".quick-row")).toHaveCount(3);
    const expand = region.getByRole("button", { name: locale === "en" ? "Show all 4 combinations" : "展开全部 4 个组合", exact: true });
    await expect(expand).toHaveAttribute("aria-expanded", "false");
    const listId = await expand.getAttribute("aria-controls");
    expect(listId).toBeTruthy();
    expect(await region.locator(".native-list").getAttribute("id")).toBe(listId);
    await expand.focus();
    await page.keyboard.press("Enter");
    await expect(region.locator(".quick-row")).toHaveCount(4);
    const collapse = region.getByRole("button", { name: locale === "en" ? "Show fewer combinations" : "收起组合", exact: true });
    await expect(collapse).toHaveAttribute("aria-expanded", "true");
    await collapse.click();
    await expect(region.locator(".quick-row")).toHaveCount(3);
    await expand.click();
    const removedTitle = await region.locator(".quick-row").last().locator("strong").innerText();
    await region.locator(".quick-row").last().getByRole("button", { name: locale === "en" ? /Remove combination/ : /移除组合/ }).click();
    await expect(region.locator(".quick-row")).toHaveCount(3);
    await expect(region.getByRole("button", { name: locale === "en" ? "Show fewer combinations" : "收起组合", exact: true })).toHaveCount(0);
    await page.reload();
    await expect(region.locator(".quick-row")).toHaveCount(3);
    await expect(region.locator("strong").filter({ hasText: removedTitle })).toHaveCount(0);
    await page.goto("/#settings");
    await expect(page.getByText(locale === "en"
      ? "Review and learning helper explanations follow your interface language; English practice content stays in English."
      : "复习与学习辅助提示词的解释语言会跟随界面语言，英语练习内容保持英文。", { exact: true })).toBeVisible();
  });
}
