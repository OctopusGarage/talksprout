import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { prompts } from "../src/prompts";
test("bilingual directories, modal feedback, focus and locale persistence", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "中文", exact: true }),
  ).toBeVisible();
  await page.locator('[data-collection="companions"]').click();
  await page.locator('.detail-link[data-detail="gentle-start"]').click();
  await expect(page.getByRole("dialog")).toHaveAccessibleName(
    "Gentle Conversation Coach",
  );
  await page.getByRole("button", { name: "Copy full prompt" }).click();
  await expect(
    page.getByRole("button", { name: "Copied ✓", exact: true }),
  ).toBeInViewport();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    prompts.find((p) => p.id === "gentle-start")!.prompt,
  );
  await page.keyboard.press("Escape");
  await expect(
    page.locator('.detail-link[data-detail="gentle-start"]'),
  ).toBeFocused();
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("searchbox")).toHaveAttribute(
    "aria-label",
    "搜索陪练模式",
  );
});
test("old favorites cannot surface removed tools", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "talksprout:favorites",
      JSON.stringify(["conversation-expression-review", "gentle-start"]),
    );
    localStorage.setItem(
      "talksprout:recent",
      JSON.stringify(["shadowing-companion", "gentle-start"]),
    );
  });
  await page.goto("/");
  await page.locator("#favorites").click();
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(page.locator(".card h3")).toHaveText("温柔引导纠正");
});
test("main views, prompt and settings sheets, and recovery have no detected AA violations", async ({
  page,
}) => {
  await page.goto("/");
  for (const stage of [
    "directory",
    "folder",
    "dialog",
    "settings",
    "instructions",
    "installation",
    "recovery",
  ]) {
    if (stage === "folder")
      await page.locator('[data-collection="interaction"]').click();
    if (stage === "dialog") {
      await page.getByRole("button", { name: "English", exact: true }).click();
      await page.locator('.detail-link[data-detail="roleplay-coach"]').click();
    }
    if (stage === "settings") {
      await page.keyboard.press("Escape");
      await page.getByRole("link", { name: "Settings", exact: true }).click();
    }
    if (stage === "instructions") await page.locator("#about").click();
    if (stage === "installation") {
      await page.keyboard.press("Escape");
      await page.goto("/#settings?info=install");
      await expect(page.getByRole("dialog")).toBeVisible();
    }
    if (stage === "recovery") await page.goto("/recover.html");
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      scan.violations.map((v) => ({ id: v.id, nodes: v.nodes.length })),
      stage,
    ).toEqual([]);
  }
});
test("English and Chinese directory and folder layouts fit narrow phones and desktop", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const language of ["zh", "en"]) {
      if ((await page.locator("html").getAttribute("lang")) !== language)
        await page
          .getByRole("button", {
            name: language === "en" ? "English" : "中文",
            exact: true,
          })
          .click();
      for (const [hash, count] of [
        ["#library", 0],
        ["#collection/companions", 4],
        ["#collection/interaction", 3],
        ["#collection/materials", 2],
      ] as const) {
        await page.goto(`/${hash}`);
        await expect(page.locator(".card")).toHaveCount(count);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${width} ${language} ${hash}`,
        ).toBe(true);
        expect(
          await page
            .getByTestId("page-scroll")
            .evaluate((element) => element.scrollWidth <= element.clientWidth),
          `${width} ${language} ${hash} content`,
        ).toBe(true);
      }
    }
  }
  await page.goto("/#library");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: "test-results/directory.png" });
});
