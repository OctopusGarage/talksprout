import { test, expect } from "@playwright/test";
test("navigation has one action per label and English chat examples explain where to use them", async ({
  page,
}) => {
  await page.goto("/#collection/companions");
  await expect(
    page.getByRole("button", { name: "← 返回分类", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "清除筛选", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("searchbox").fill("no-such-coach");
  await page.getByRole("button", { name: "清除筛选", exact: true }).click();
  await expect(page.locator(".card")).toHaveCount(4);
  await expect(page).toHaveURL(/#collection\/companions$/);
  await page.locator('.detail-link[data-detail="daily-check-in"]').click();
  await page.getByText("和 AI 聊天时，可以这样说", { exact: true }).click();
  const tips = page.locator(".chat-tips");
  await expect(tips).toContainText("在你使用的 AI 聊天里");
  await expect(tips.locator("dt")).toHaveText([
    "Help, please.",
    "Review, please.",
    "Let's finish.",
  ]);
  expect(await tips.innerText()).not.toMatch(/练习口令|帮我一下|结束练习|\//);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "← 返回分类", exact: true }).click();
  await expect(page.locator(".collection-card")).toHaveCount(3);
});
