import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { handbookArticles } from "../src/content/guides";

test("companion guides retain the original stages and contextual practice links", async ({ page }) => {
  await page.goto("/#guides");
  await expect(page.getByRole("button", { name: "配套指南", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".guide-entry")).toHaveCount(11);
  for (const name of ["开始前", "听说读写练习", "结束后复习"]) await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await page.getByRole("searchbox").fill("听写");
  await expect(page.locator(".guide-entry")).toHaveCount(2);
  await page.locator(".guide-entry").filter({ hasText: "一段短音频的精听与跟读" }).click();
  await expect(page.getByRole("article")).toContainText("选择对应的听力工具");
  await page.getByRole("button", { name: "返回配套指南", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("听写");
  await expect(page.locator(".guide-entry").filter({ hasText: "一段短音频的精听与跟读" })).toBeFocused();
  await page.getByRole("button", { name: "清除筛选", exact: true }).click();
  await page.goto("/#guides/choose-feedback-style");
  await page.getByRole("link", { name: "严格纠错重练", exact: true }).click();
  await expect(page).toHaveURL(/#library\?prompt=focused-correction$/);
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("further resources retain categories, independent filters and three AI usage articles", async ({ page }) => {
  await page.goto("/#guides");
  await page.getByRole("button", { name: "扩展资料", exact: true }).click();
  await expect(page).toHaveURL(/#guides\?section=reading$/);
  await expect(page.getByRole("searchbox")).toHaveAttribute("placeholder", "搜索指南内容");
  await expect(page.locator(".guide-entry")).toHaveCount(10);
  await expect(page.getByRole("button", { name: "精选资料", exact: true })).toHaveCount(0);
  await expect(page.getByText("英语学习资料怎么用", { exact: true })).toHaveCount(0);
  for (const name of ["学习方法论", "AI 使用参考"]) await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  await page.getByRole("button", { name: "AI 使用参考", exact: true }).click();
  await page.getByRole("searchbox").fill("实时语音");
  await expect(page.locator(".guide-entry")).toHaveCount(1);
  await page.locator(".guide-entry").click();
  await expect(page.locator("#library-heading")).toHaveText("实时语音：用 AI 练听说");
  await expect(page.getByRole("article").getByRole("link")).toHaveCount(0);
  await page.getByRole("button", { name: "返回扩展资料", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("实时语音");
  await expect(page.locator(".guide-entry")).toBeFocused();
  await page.getByRole("button", { name: "配套指南", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await expect(page.locator(".guide-entry")).toHaveCount(11);
  await page.getByRole("button", { name: "扩展资料", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("实时语音");
});

test("article identities stay distinct and source clutter remains absent", async ({ page }) => {
  for (const article of handbookArticles) {
    await page.goto(`/#guides/${article.id}`);
    await expect(page.getByRole("article")).toBeVisible();
    await expect(page.locator("#library-heading")).toHaveText(article.title.zh);
    await expect(page.getByRole("article").locator('a[href^="http"]')).toHaveCount(0);
    await expect(page.getByRole("article").getByRole("link")).toHaveCount(article.practice?.length ?? 0);
    await expect(page.locator(".guide-sources, .reading-resources, .guide-outline")).toHaveCount(0);
  }
});

test("resource reading is accessible, bilingual and bounded on small and large screens", async ({ page }) => {
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (const id of ["gemini-learning", "ai-dedicated-companions", "ai-global-instructions"]) {
    await page.goto(`/#guides/${id}`);
    await expect(page.getByRole("article")).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.locator("a.skip").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#library-heading")).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  }
  await page.goto("/#guides/gemini-learning");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.reload();
  await expect(page.locator("#library-heading")).toHaveText("Live voice: practise listening and speaking");
  await page.getByRole("button", { name: "Back to further resources", exact: true }).click();
  await expect(page).toHaveURL(/#guides\?section=reading$/);
});

test("both directories preserve reading position and cached resources work offline", async ({ page, context }) => {
  await page.goto("/#guides?section=reading");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
  });
  const region = page.getByTestId("page-scroll");
  for (const shelf of [{url:"/#guides?section=reading",back:"返回扩展资料"},{url:"/#guides",back:"返回配套指南"}]) {
    await page.goto(shelf.url);
    await region.evaluate(el => { el.scrollTop = el.scrollHeight; });
    const position = await region.evaluate(el => el.scrollTop);
    await page.locator(".guide-entry").last().click();
    await page.getByRole("button", { name: shelf.back, exact: true }).click();
    await expect.poll(async () => Math.abs(await region.evaluate(el => el.scrollTop) - position)).toBeLessThanOrEqual(2);
  }
  await context.setOffline(true);
  await page.goto("/#guides/doubao-learning");
  await page.reload();
  await expect(page.getByRole("article")).toBeVisible();
  await expect(page.locator("#library-heading")).toHaveText("实时语音：用 AI 练听说");
});

test("the former article URLs return to their own collection", async ({ page }) => {
  await page.goto("/#guides/four-strands-of-language-learning");
  await expect(page.locator("#library-heading")).toHaveText("英语学习的四条主线");
  await page.getByRole("button", { name: "返回扩展资料", exact: true }).click();
  await expect(page).toHaveURL(/#guides\?section=reading$/);
  await page.goto("/#guides/build-a-learning-routine");
  await expect(page.locator("#library-heading")).toHaveText("建立能坚持的英语学习习惯");
  await page.getByRole("button", { name: "返回配套指南", exact: true }).click();
  await expect(page).toHaveURL(/#guides$/);
  await page.goto("/#guides/missing");
  await expect(page.getByRole("heading", { name: "没有找到这篇文章" })).toBeVisible();
});

test("dedicated configurations and global rules copy exactly with manual fallback", async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { value: { writeText: async (value: string) => { (window as unknown as { capturedPrompt: string }).capturedPrompt = value; } }, configurable: true }); });
  await page.goto("/#guides/ai-dedicated-companions");
  const blocks = page.locator(".guide-prompt");
  await expect(blocks).toHaveCount(6);
  for (const block of await blocks.all()) {
    const expected = await block.locator("textarea").inputValue();
    await block.getByRole("button", { name: "复制提示词", exact: true }).click();
    await expect(block.getByRole("status")).toContainText("已复制");
    expect(await page.evaluate(() => (window as unknown as { capturedPrompt: string }).capturedPrompt)).toBe(expected);
  }
  await page.goto("/#guides/ai-global-instructions");
  const strict = page.locator(".guide-prompt").filter({ hasText: "严格英语门槛" });
  await strict.getByRole("button", { name: "复制提示词", exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { capturedPrompt: string }).capturedPrompt)).toBe(await strict.locator("textarea").inputValue());
  await page.evaluate(() => { Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => { throw new Error("denied"); } }, configurable: true }); });
  await strict.getByRole("button", { name: "复制提示词", exact: true }).click();
  await expect(strict.getByRole("status")).toContainText("手动复制");
  await expect(strict.locator("textarea")).toBeFocused();
  expect(await strict.locator("textarea").evaluate((el: HTMLTextAreaElement) => el.selectionEnd - el.selectionStart)).toBe((await strict.locator("textarea").inputValue()).length);
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator(".guide-prompt").first().getByRole("button", { name: "Copy prompt", exact: true })).toBeVisible();
  await expect(page.locator(".guide-prompt").last().locator("textarea")).toHaveValue(/Always require the user to communicate primarily in English/);
});

test("pending guide copies cannot show stale feedback after leaving the article", async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { value: { writeText: () => new Promise<void>((_resolve, reject) => { (window as unknown as { failGuideCopy: () => void }).failGuideCopy = () => reject(new Error("late failure")); }) }, configurable: true }); });
  await page.goto("/#guides/ai-dedicated-companions");
  await page.locator(".guide-prompt").first().getByRole("button", { name: "复制提示词", exact: true }).click();
  await expect(page.locator(".guide-prompt button").first()).toBeDisabled();
  await page.getByRole("button", { name: "返回扩展资料", exact: true }).click();
  await page.evaluate(() => (window as unknown as { failGuideCopy: () => void }).failGuideCopy());
  await expect(page.getByRole("searchbox")).toBeVisible();
  await expect(page.getByText("自动复制不可用，请手动复制已选中的提示词。", { exact: true })).toHaveCount(0);
});


test("complete workflow is first, bilingual and reachable from AI setup", async ({ page }) => {
  await page.goto("/#guides");
  await expect(page.locator(".guide-entry").first()).toContainText("从开始练习到保存笔记");
  await page.goto("/#ai");
  await page.getByRole("link", { name: "完整使用流程：从练习到保存笔记" }).click();
  await expect(page).toHaveURL(/#guides\/complete-workflow$/);
  for (const title of ["复制提示词开始", "直接在 AI 中选择", "开启语音", "保存需要的内容"]) {
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  }
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("#library-heading")).toHaveText("From first practice to saved study notes");
  await expect(page.getByRole("heading", { name: "Start by copying a prompt", exact: true })).toBeVisible();
});

test("settings instructions lead to the complete workflow without leaving a dialog open", async ({ page }) => {
  await page.goto("/#settings?info=about");
  await page.getByRole("dialog").getByRole("link", { name: "完整使用流程：从练习到保存笔记" }).click();
  await expect(page).toHaveURL(/#guides\/complete-workflow$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("#library-heading")).toHaveText("从开始练习到保存笔记");
});

test("method articles open the matching targeted practice without a scenario questionnaire", async ({
  page,
}) => {
  for (const [article, tool, id] of [
    ["chunks-in-new-contexts", "句型变式练习", "pattern-variation"],
    ["repeat-and-transfer", "情境回忆练习", "expression-recall"],
    ["explain-in-simple-english", "简单英语改述", "plain-english"],
  ]) {
    await page.goto(`/#guides/${article}`);
    await page.getByRole("link", { name: tool, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#library\\?prompt=${id}$`));
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("#prompt-text")).not.toHaveValue("");
    await expect(page.locator(".scenario-settings")).toHaveCount(0);
    await page.keyboard.press("Escape");
  }
});
