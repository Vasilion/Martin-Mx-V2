import "server-only";
import { park } from "@/lib/park/facts";

export type DayForecast = {
  date: string;
  code: number;
  highF: number;
  lowF: number;
  rainChance: number;
};

export type Weather = {
  current: { tempF: number; windMph: number; code: number };
  days: DayForecast[];
};

/** Open-Meteo, no key. Cached 15 minutes; returns null rather than breaking the page. */
export async function getWeather(): Promise<Weather | null> {
  const { lat, lng } = park.weatherGeo;
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&timezone=${encodeURIComponent(park.timeZone)}&temperature_unit=fahrenheit&wind_speed_unit=mph` +
    `&current=temperature_2m,wind_speed_10m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=10`;
  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      current: {
        tempF: Math.round(data.current.temperature_2m),
        windMph: Math.round(data.current.wind_speed_10m),
        code: data.current.weather_code,
      },
      days: (data.daily.time as string[]).map((date, i) => ({
        date,
        code: data.daily.weather_code[i],
        highF: Math.round(data.daily.temperature_2m_max[i]),
        lowF: Math.round(data.daily.temperature_2m_min[i]),
        rainChance: data.daily.precipitation_probability_max[i] ?? 0,
      })),
    };
  } catch {
    return null;
  }
}

/** WMO weather code -> short rider-facing label. */
export function describeWeather(code: number) {
  if (code === 0) return "Clear";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Fog";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorms";
}
