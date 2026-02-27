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

test("practice signup form submits and returns reference", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Rider Name").first().fill("Practice Rider");
  await page.getByLabel("Email").first().fill("practice-rider@example.com");
  await page.getByLabel("Phone").first().fill("6167771234");
  await page.getByLabel("Rider Age").first().fill("21");
  await page.getByLabel("Bike Class").first().selectOption("A/B");
  await page.getByLabel("Bike Size").first().selectOption("250cc");
  await page.getByLabel("Practice Date").first().fill("2026-03-04");
  await page.getByLabel("Session").first().selectOption("Wednesday Session");
  await page.getByLabel("Track Type").first().selectOption("Main");
  await page.getByLabel("Price").first().fill("40");
  await page.getByLabel("Payment Status").first().selectOption("paid");
  await page.getByRole("button", { name: "Submit" }).first().click();
  await expect(page).toHaveURL(/\/payment-success\?referenceId=/);
  await expect(page.getByRole("heading", { name: "Practice Payment Success" })).toBeVisible();
});
