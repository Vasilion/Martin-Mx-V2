import { expect, test } from "@playwright/test";

test("core routes load", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome to Martin MX Park" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operations Snapshot" })).toBeVisible();

  const routes = [
    "/register",
    "/schedule",
    "/track-info",
    "/gallery",
    "/sponsors",
    "/hiring",
    "/daily-signup",
    "/admin-dashboard",
  ];
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

test("membership signup form redirects to membership success", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Rider Name").nth(1).fill("Membership Rider");
  await page.getByLabel("Email").nth(1).fill("membership-rider@example.com");
  await page.getByLabel("Phone").nth(1).fill("6168881234");
  await page.getByLabel("Rider Age").nth(1).fill("29");
  await page.getByLabel("Bike Class").nth(1).selectOption("A/B");
  await page.getByLabel("Bike Size").nth(1).selectOption("250cc");
  await page.getByLabel("Membership Type").selectOption("Unlimited");
  await page.getByLabel("Membership Price").fill("750");
  await page.getByLabel("Payment Status").nth(1).selectOption("paid");
  await page.getByRole("button", { name: "Submit" }).nth(1).click();
  await expect(page).toHaveURL(/\/membership-payment-success\?referenceId=/);
  await expect(page.getByRole("heading", { name: "Membership Payment Success" })).toBeVisible();
});

test("admin dashboard shows recent signup references", async ({ page }) => {
  const selectedDate = "2026-04-15";
  await page.goto("/register");
  await page.getByLabel("Rider Name").first().fill("Dashboard Check Rider");
  await page.getByLabel("Email").first().fill("dashboard-practice@example.com");
  await page.getByLabel("Phone").first().fill("6161231234");
  await page.getByLabel("Rider Age").first().fill("24");
  await page.getByLabel("Bike Class").first().selectOption("A/B");
  await page.getByLabel("Bike Size").first().selectOption("250cc");
  await page.getByLabel("Practice Date").first().fill(selectedDate);
  await page.getByLabel("Session").first().selectOption("Wednesday Session");
  await page.getByLabel("Track Type").first().selectOption("Main");
  await page.getByLabel("Price").first().fill("40");
  await page.getByLabel("Payment Status").first().selectOption("paid");
  await page.getByRole("button", { name: "Submit" }).first().click();

  await expect(page).toHaveURL(/\/payment-success\?referenceId=/);
  const url = new URL(page.url());
  const referenceId = url.searchParams.get("referenceId") ?? "";

  await page.goto(`/admin-dashboard?selectedDate=${selectedDate}`);
  await expect(page.getByText(referenceId)).toBeVisible();
});
