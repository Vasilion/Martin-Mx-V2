import { expect, test } from "@playwright/test";

test("core routes load", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome to Martin MX Park" })).toBeVisible();
  await expect(page.getByText("Practice Status")).toBeVisible();

  const routes = ["/register", "/schedule", "/track-info", "/gallery", "/sponsors", "/hiring", "/daily-signup"];
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
  }
});
