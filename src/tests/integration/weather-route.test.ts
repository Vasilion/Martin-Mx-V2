import { describe, expect, it, vi } from "vitest";

describe("weather API route", () => {
  it("returns mapped weather payload", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            current_weather: {
              temperature: 12.5,
              windspeed: 8.4,
            },
          }),
          { status: 200 },
        ),
      );

    const { GET } = await import("@/app/api/weather/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.temperature).toBe(12.5);
    expect(body.windspeed).toBe(8.4);

    fetchMock.mockRestore();
  });
});
