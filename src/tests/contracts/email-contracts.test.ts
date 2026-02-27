import { describe, expect, it } from "vitest";
import { buildConfirmationEmail } from "@/lib/forms/email";

describe("email payload contracts", () => {
  it("includes all membership fields in confirmation email", () => {
    const payload = {
      riderFullName: "Rider One",
      riderEmail: "rider@example.com",
      riderPhone: "6160000000",
      riderAge: "19",
      bikeClass: "C",
      bikeSize: "250cc",
      membershipType: "Unlimited",
      membershipPrice: 350,
      paymentStatus: "paid",
    };

    const email = buildConfirmationEmail("membership", payload, "ref-123");

    Object.entries(payload).forEach(([key, value]) => {
      expect(email.text).toContain(`${key}: ${String(value)}`);
    });
    expect(email.subject).toContain("Membership");
  });

  it("includes all practice fields in confirmation email", () => {
    const payload = {
      riderFullName: "Rider Two",
      riderEmail: "rider2@example.com",
      riderPhone: "6161111111",
      riderAge: "16",
      bikeClass: "Mini",
      bikeSize: "85cc",
      selectedDate: "2026-03-12",
      selectedSessionOrTimeWindow: "AM",
      trackType: "Junior",
      priceShownAtCheckout: 40,
      paymentStatus: "paid",
    };

    const email = buildConfirmationEmail("practice", payload, "ref-456");
    Object.entries(payload).forEach(([key, value]) => {
      expect(email.text).toContain(`${key}: ${String(value)}`);
    });
    expect(email.subject).toContain(payload.selectedDate);
  });
});
