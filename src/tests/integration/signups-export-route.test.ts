import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const listSignups = vi.fn();

vi.mock("@/lib/store", () => ({
  getSignupStore: () => ({
    listSignups,
  }),
}));

describe("signups export API route", () => {
  it("returns csv output for filtered signups", async () => {
    listSignups.mockResolvedValue([
      {
        referenceId: "ref-1",
        formType: "practice",
        createdAt: "2026-03-01T12:00:00.000Z",
        payload: {
          riderFullName: "Rider A",
          riderEmail: "rider@example.com",
          bikeClass: "A/B",
          selectedDate: "2026-03-01",
        },
      },
    ]);

    const { GET } = await import("@/app/api/signups/export/route");
    const request = new NextRequest(
      "http://localhost/api/signups/export?selectedDate=2026-03-01&bikeClass=A/B&formType=practice",
    );
    const response = await GET(request);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/csv");
    expect(text).toContain("referenceId,formType,createdAt");
    expect(text).toContain("ref-1,practice,2026-03-01T12:00:00.000Z,Rider A,rider@example.com,A/B,2026-03-01");
  });
});
