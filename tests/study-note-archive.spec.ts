import { test, expect } from "@playwright/test";
import {
  buildStudyNoteArchiveGuide,
  studyMaterialArchiveExample,
} from "../src/content/study-note-archive";
import { reviewPrompts } from "../src/prompts";
import { promptText } from "../src/prompt-text";

test("archive guidance copies separately from installation and review instructions", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("talksprout:locale", "zh");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as unknown as { noteCopy: string }).noteCopy = value;
        },
      },
    });
  });
  await page.goto("/#ai");
  await page.getByText("保存笔记", { exact: true }).click();
  await page.getByRole("button", { name: "复制规则", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { noteCopy: string }).noteCopy),
    )
    .toBe(buildStudyNoteArchiveGuide());
  await page.goto("/#review?prompt=review-cards");
  await expect(page.locator("#prompt-text")).toHaveValue(
    promptText(
      reviewPrompts.find((p) => p.id === "review-cards")!,
      "full",
      "current",
      "zh",
    ),
  );
  await page.getByText("保存学习资料", { exact: true }).click();
  await expect(page.locator(".archive-tips code")).toHaveText(
    studyMaterialArchiveExample("zh", "review-cards"),
  );
  await page
    .getByRole("link", { name: "到 AI 接入页复制归档规范", exact: true })
    .click();
  await expect(page).toHaveURL(/#ai$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
