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

test("contact form submits and returns reference", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Full Name").fill("Test Rider");
  await page.getByLabel("Email").fill("testrider@example.com");
  await page.getByLabel("Phone").fill("6165551212");
  await page.getByLabel("Subject").fill("Testing submit flow");
  await page.getByLabel("Message").fill("This is an e2e submission test.");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Submitted successfully. Reference:")).toBeVisible();
});
