import { describe, expect, it } from "vitest";
import { formSchemas } from "@/lib/forms/schemas";

describe("form schema validation", () => {
  it("accepts a valid practice signup", () => {
    const result = formSchemas.practice.safeParse({
      riderFullName: "Test Rider",
      riderEmail: "test@example.com",
      riderPhone: "6160000000",
      riderAge: "22",
      bikeClass: "AB",
      bikeSize: "450cc",
      selectedDate: "2026-05-01",
      selectedSessionOrTimeWindow: "Morning",
      trackType: "Main",
      priceShownAtCheckout: 40,
      paymentStatus: "paid",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing membership bike size", () => {
    const result = formSchemas.membership.safeParse({
      riderFullName: "Test Rider",
      riderEmail: "test@example.com",
      riderPhone: "6160000000",
      riderAge: "22",
      bikeClass: "AB",
      membershipType: "Unlimited",
      membershipPrice: 350,
      paymentStatus: "paid",
    });
    expect(result.success).toBe(false);
  });
});
