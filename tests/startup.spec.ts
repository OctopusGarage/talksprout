import { test, expect } from "@playwright/test";
test("a failed application script shows a working recovery screen instead of white", async ({
  page,
}) => {
  await page.route("**/assets/*.js", (route) => route.abort("failed"));
  await page.goto("/");
  await expect(page.locator("#boot-fallback")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "重新加载", exact: true }),
  ).toBeVisible();
  await page.unroute("**/assets/*.js");
  await page.getByRole("button", { name: "重新加载", exact: true }).click();
  await expect(page.locator(".collection-card")).toHaveCount(3);
  await expect(page.locator("#boot-fallback")).toBeHidden();
});

test("standalone recovery preserves favorites and unrelated site caches", async ({
  page,
}) => {
  await page.goto("/recover.html");
  await page.evaluate(async () => {
    localStorage.setItem(
      "talksprout:favorites",
      JSON.stringify(["gentle-start"]),
    );
    await caches.open("unrelated-project");
    // The pre-scope cache has ambiguous ownership and must survive migration.
    await caches.open("talksprout-obsolete");
    await caches.open("talksprout-scope-" + encodeURIComponent(new URL("./", location.href).href) + "-obsolete");
    await caches.open("talksprout-scope-" + encodeURIComponent(new URL("./other/", location.href).href) + "-obsolete");
  });
  await page.getByRole("button", { name: "重新打开", exact: true }).click();
  await expect(page.locator(".collection-card")).toHaveCount(3);
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("talksprout:favorites") || "[]"),
    ),
  ).toContain("gentle-start");
  expect(await page.evaluate(() => caches.has("unrelated-project"))).toBe(true);
  expect(await page.evaluate(() => caches.has("talksprout-obsolete"))).toBe(
    true,
  );
  expect(await page.evaluate(() => caches.has("talksprout-scope-" + encodeURIComponent(new URL("./", location.href).href) + "-obsolete"))).toBe(false);
  expect(await page.evaluate(() => caches.has("talksprout-scope-" + encodeURIComponent(new URL("./other/", location.href).href) + "-obsolete"))).toBe(true);
});
