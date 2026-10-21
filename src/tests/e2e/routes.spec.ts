import { expect, test } from "@playwright/test";

const routes = ["/", "/schedule", "/track-info", "/register", "/register?tab=membership", "/gallery", "/sponsors", "/hiring", "/contact"];

test("every public page renders a heading and no client errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const route of routes) {
    const res = await page.goto(route);
    expect(res?.status(), route).toBe(200);
    await expect(page.locator("h1").first(), route).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("dashboard requires sign-in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  const res = await page.request.get("/admin/export?date=2026-01-01");
  expect(res.status()).toBe(401);
});
