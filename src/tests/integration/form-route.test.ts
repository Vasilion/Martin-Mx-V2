import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const putIfAbsent = vi.fn();
const decrementSpotCounter = vi.fn();
const sendTextEmail = vi.fn();

vi.mock("@/lib/store", () => ({
  getSignupStore: () => ({
    putIfAbsent,
    decrementSpotCounter,
  }),
}));

vi.mock("@/lib/email/ses", () => ({
  sendTextEmail,
}));

describe("forms API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    putIfAbsent.mockResolvedValue({ created: true });
    decrementSpotCounter.mockResolvedValue(99);
    sendTextEmail.mockResolvedValue(undefined);
  });

  it("returns 200 for valid membership payload", async () => {
    const { POST } = await import("@/app/api/forms/[formType]/route");
    const request = new NextRequest("http://localhost/api/forms/membership", {
      method: "POST",
      body: JSON.stringify({
        riderFullName: "Rider",
        riderEmail: "rider@example.com",
        riderPhone: "6161231234",
        riderAge: "30",
        bikeClass: "AB",
        bikeSize: "450cc",
        membershipType: "Unlimited",
        membershipPrice: 350,
        paymentStatus: "paid",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request, { params: Promise.resolve({ formType: "membership" }) });
    expect(response.status).toBe(200);
    expect(sendTextEmail).toHaveBeenCalledTimes(1);
  });

  it("returns 400 for invalid payload", async () => {
    const { POST } = await import("@/app/api/forms/[formType]/route");
    const request = new NextRequest("http://localhost/api/forms/membership", {
      method: "POST",
      body: JSON.stringify({
        riderFullName: "Rider",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request, { params: Promise.resolve({ formType: "membership" }) });
    expect(response.status).toBe(400);
  });

  it("swallows spam payload via honeypot", async () => {
    const { POST } = await import("@/app/api/forms/[formType]/route");
    const request = new NextRequest("http://localhost/api/forms/membership", {
      method: "POST",
      body: JSON.stringify({
        riderFullName: "Rider",
        riderEmail: "rider@example.com",
        riderPhone: "6161231234",
        riderAge: "30",
        bikeClass: "AB",
        bikeSize: "450cc",
        membershipType: "Unlimited",
        membershipPrice: 350,
        paymentStatus: "paid",
        website: "bot-filled",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request, { params: Promise.resolve({ formType: "membership" }) });
    expect(response.status).toBe(200);
    expect(sendTextEmail).not.toHaveBeenCalled();
  });

  it("returns 429 after rate limit is exceeded", async () => {
    const { POST } = await import("@/app/api/forms/[formType]/route");

    let lastStatus = 200;
    for (let i = 0; i < 21; i += 1) {
      const request = new NextRequest("http://localhost/api/forms/membership", {
        method: "POST",
        body: JSON.stringify({
          riderFullName: "Rider",
          riderEmail: "rider@example.com",
          riderPhone: "6161231234",
          riderAge: "30",
          bikeClass: "AB",
          bikeSize: "450cc",
          membershipType: "Unlimited",
          membershipPrice: 350,
          paymentStatus: "paid",
        }),
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.0.77",
        },
      });
      const response = await POST(request, { params: Promise.resolve({ formType: "membership" }) });
      lastStatus = response.status;
    }

    expect(lastStatus).toBe(429);
  });
});
