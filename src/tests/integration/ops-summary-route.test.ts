import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const listSignups = vi.fn();

vi.mock("@/lib/store", () => ({
  getSignupStore: () => ({
    listSignups,
  }),
}));

describe("ops summary API route", () => {
  it("returns summary and recent signup rows", async () => {
    listSignups.mockResolvedValue([
      {
        referenceId: "ref-1",
        formType: "practice",
        createdAt: "2026-03-01T12:00:00.000Z",
        payload: {
          riderFullName: "Rider A",
          bikeClass: "A/B",
          selectedDate: "2026-03-01",
        },
      },
      {
        referenceId: "ref-2",
        formType: "contact",
        createdAt: "2026-03-01T11:00:00.000Z",
        payload: {
          fullName: "Contact B",
        },
      },
    ]);

    const { GET } = await import("@/app/api/ops/summary/route");
    const request = new NextRequest("http://localhost/api/ops/summary");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.summary.total).toBe(2);
    expect(body.summary.byFormType.practice).toBe(1);
    expect(body.summary.byFormType.contact).toBe(1);
    expect(body.recent[0].referenceId).toBe("ref-1");
  });
});
