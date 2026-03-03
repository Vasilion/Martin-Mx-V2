import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=42.54&longitude=-85.64&timezone=America%2FNew_York&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7",
    {
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Weather upstream request failed." }, { status: 502 });
  }

  const payload = (await response.json()) as {
    timezone?: string;
    current?: {
      time?: string;
      temperature_2m?: number;
      wind_speed_10m?: number;
      wind_direction_10m?: number;
      weather_code?: number;
    };
    hourly?: {
      time?: string[];
      temperature_2m?: number[];
      precipitation_probability?: number[];
      wind_speed_10m?: number[];
      weather_code?: number[];
    };
    daily?: {
      time?: string[];
      weather_code?: number[];
      temperature_2m_max?: number[];
      temperature_2m_min?: number[];
      precipitation_probability_max?: number[];
    };
  };

  const current = payload.current;
  const hourly = payload.hourly;
  const daily = payload.daily;

  return NextResponse.json({
    timezone: payload.timezone ?? "America/New_York",
    current: {
      observedAt: current?.time ?? null,
      temperatureC: current?.temperature_2m ?? null,
      windKph: current?.wind_speed_10m ?? null,
      windDirection: current?.wind_direction_10m ?? null,
      weatherCode: current?.weather_code ?? null,
    },
    hourly: {
      time: hourly?.time ?? [],
      temperatureC: hourly?.temperature_2m ?? [],
      precipitationChance: hourly?.precipitation_probability ?? [],
      windKph: hourly?.wind_speed_10m ?? [],
      weatherCode: hourly?.weather_code ?? [],
    },
    daily: {
      date: daily?.time ?? [],
      weatherCode: daily?.weather_code ?? [],
      highC: daily?.temperature_2m_max ?? [],
      lowC: daily?.temperature_2m_min ?? [],
      precipitationChance: daily?.precipitation_probability_max ?? [],
    },
  });
}
