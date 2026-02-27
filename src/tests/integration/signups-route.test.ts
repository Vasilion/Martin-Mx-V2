import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

const listSignups = vi.fn();

vi.mock("@/lib/store", () => ({
  getSignupStore: () => ({
    listSignups,
  }),
}));

describe("signups API route", () => {
  it("returns filtered signup list", async () => {
    listSignups.mockResolvedValue([
      {
        referenceId: "ref-1",
        formType: "practice",
        createdAt: new Date().toISOString(),
        payload: { riderFullName: "Rider A" },
      },
    ]);
    const { GET } = await import("@/app/api/signups/route");
    const request = new NextRequest(
      "http://localhost/api/signups?selectedDate=2026-03-01&bikeClass=AB&formType=practice",
    );
    const response = await GET(request);
    expect(response.status).toBe(200);
    expect(listSignups).toHaveBeenCalledWith({
      selectedDate: "2026-03-01",
      bikeClass: "AB",
      formType: "practice",
    });
  });
});
