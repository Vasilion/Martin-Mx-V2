import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=42.54&longitude=-85.64&current_weather=true",
    {
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Weather upstream request failed." }, { status: 502 });
  }

  const payload = (await response.json()) as {
    current_weather?: { temperature?: number; windspeed?: number };
  };

  return NextResponse.json({
    temperature: payload.current_weather?.temperature ?? null,
    windspeed: payload.current_weather?.windspeed ?? null,
  });
}
