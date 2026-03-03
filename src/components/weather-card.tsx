"use client";

import { useEffect, useState } from "react";

type WeatherResponse = {
  timezone: string;
  current: {
    observedAt: string | null;
    temperatureC: number | null;
    windKph: number | null;
    windDirection: number | null;
    weatherCode: number | null;
  };
  hourly: {
    time: string[];
    temperatureC: number[];
    precipitationChance: number[];
    windKph: number[];
    weatherCode: number[];
  };
  daily: {
    date: string[];
    weatherCode: number[];
    highC: number[];
    lowC: number[];
    precipitationChance: number[];
  };
};

type TabId = "now" | "forecast" | "radar";

const weatherCodeLabels: Record<number, string> = {
  0: "Clear",
  1: "Mostly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime Fog",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  56: "Freezing Drizzle",
  57: "Heavy Freezing Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  66: "Freezing Rain",
  67: "Heavy Freezing Rain",
  71: "Light Snow",
  73: "Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Rain Showers",
  81: "Heavy Showers",
  82: "Violent Showers",
  85: "Snow Showers",
  86: "Heavy Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm Hail",
  99: "Severe Thunderstorm Hail",
};

function toFahrenheit(celsius: number | null) {
  if (celsius === null) {
    return null;
  }
  return (celsius * 9) / 5 + 32;
}

function windDirectionLabel(degrees: number | null) {
  if (degrees === null) {
    return "--";
  }
  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return labels[index];
}

function formatHourEST(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });
}

function formatDayLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "2-digit",
    day: "2-digit",
  });
}

function weatherLabel(code: number | null) {
  if (code === null) {
    return "Unknown";
  }
  return weatherCodeLabels[code] ?? "Unknown";
}

export function WeatherCard() {
  const [activeTab, setActiveTab] = useState<TabId>("now");
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function run() {
      try {
        setIsLoading(true);
        setHasError(false);
        const response = await fetch("/api/weather");
        if (!response.ok) {
          throw new Error("Weather request failed.");
        }
        const nextData = (await response.json()) as WeatherResponse;
        setData(nextData);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
    run();
  }, []);

  const currentTempC = data?.current.temperatureC ?? null;
  const currentTempF = toFahrenheit(currentTempC);
  const currentWindKph = data?.current.windKph ?? null;
  const currentWindMph = currentWindKph === null ? null : currentWindKph * 0.621371;
  const radarUrl =
    "https://embed.windy.com/embed2.html?lat=42.54&lon=-85.64&zoom=8&level=surface&overlay=radar&menu=&message=true&marker=true&calendar=24&pressure=false&type=map&location=coordinates&detail=true&detailLat=42.54&detailLon=-85.64&metricWind=km%2Fh&metricTemp=%C2%B0F";
  const hourlyRows = data
    ? data.hourly.time.slice(0, 12).map((time, index) => ({
        time,
        temperatureC: data.hourly.temperatureC[index] ?? null,
        precipitationChance: data.hourly.precipitationChance[index] ?? null,
        windKph: data.hourly.windKph[index] ?? null,
        weatherCode: data.hourly.weatherCode[index] ?? null,
      }))
    : [];
  const dailyRows = data
    ? data.daily.date.slice(0, 6).map((date, index) => ({
        date,
        weatherCode: data.daily.weatherCode[index] ?? null,
        highC: data.daily.highC[index] ?? null,
        lowC: data.daily.lowC[index] ?? null,
        precipitationChance: data.daily.precipitationChance[index] ?? null,
      }))
    : [];

  return (
    <article className="h-full rounded-3xl border border-white/10 bg-black/20 p-6 text-white backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <h2 className="mx-display text-lg font-semibold md:text-xl">Track Weather & Radar</h2>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Martin, MI</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-zinc-950/60 p-1">
        {[
          { id: "now", label: "Now" },
          { id: "forecast", label: "Forecast" },
          { id: "radar", label: "Radar" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              activeTab === tab.id ? "bg-green-700/80 text-white" : "text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {isLoading ? <p className="mt-4 text-sm text-zinc-300">Loading weather...</p> : null}
      {hasError ? <p className="mt-4 text-sm text-red-300">Weather data is temporarily unavailable.</p> : null}
      {!isLoading && !hasError && data && activeTab === "now" ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Current Conditions</p>
            <p className="mt-2 text-3xl font-black">
              {currentTempF === null ? "--" : `${Math.round(currentTempF)}°F`}
            </p>
            <p className="mt-1 text-sm text-zinc-300">
              {currentTempC === null ? "--" : `${Math.round(currentTempC)}°C`} • {weatherLabel(data.current.weatherCode)}
            </p>
            <p className="mt-3 text-sm text-zinc-300">
              Wind {currentWindMph === null ? "--" : `${Math.round(currentWindMph)} mph`} ({windDirectionLabel(data.current.windDirection)}) •{" "}
              {currentWindKph === null ? "--" : `${Math.round(currentWindKph)} km/h`}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Updated {data.current.observedAt ? formatHourEST(data.current.observedAt) : "--"} EST
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {dailyRows.map((day) => (
              <article key={day.date} className="rounded-xl border border-white/10 bg-zinc-950/60 p-3">
                <p className="text-xs uppercase tracking-wide text-zinc-400">{formatDayLabel(day.date)}</p>
                <p className="mt-1 text-sm font-semibold text-zinc-100">{weatherLabel(day.weatherCode)}</p>
                <p className="mt-1 text-xs text-zinc-300">
                  High {day.highC === null ? "--" : `${Math.round(toFahrenheit(day.highC) ?? 0)}°F`} • Low{" "}
                  {day.lowC === null ? "--" : `${Math.round(toFahrenheit(day.lowC) ?? 0)}°F`}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Rain chance {day.precipitationChance === null ? "--" : `${Math.round(day.precipitationChance)}%`}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
      {!isLoading && !hasError && data && activeTab === "forecast" ? (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Next 12 Hours (EST)</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {hourlyRows.map((hour) => (
              <article key={hour.time} className="min-w-[135px] rounded-xl border border-white/10 bg-zinc-950/65 p-3">
                <p className="text-xs text-zinc-400">{formatHourEST(hour.time)} EST</p>
                <p className="mt-1 text-sm font-semibold">{weatherLabel(hour.weatherCode)}</p>
                <p className="mt-1 text-xs text-zinc-300">
                  {hour.temperatureC === null ? "--" : `${Math.round(toFahrenheit(hour.temperatureC) ?? 0)}°F`}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Rain {hour.precipitationChance === null ? "--" : `${Math.round(hour.precipitationChance)}%`}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Wind {hour.windKph === null ? "--" : `${Math.round(hour.windKph * 0.621371)} mph`}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
      {!isLoading && !hasError && activeTab === "radar" ? (
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-400">Live Radar</p>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/70">
            <iframe
              title="Martin MX live weather radar"
              src={radarUrl}
              className="h-[360px] w-full"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}
