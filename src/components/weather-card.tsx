"use client";

import { useEffect, useState } from "react";

type WeatherResponse = {
  temperature: number | null;
  windspeed: number | null;
};

export function WeatherCard() {
  const [temperature, setTemperature] = useState<string>("--");
  const [wind, setWind] = useState<string>("--");

  useEffect(() => {
    async function run() {
      try {
        const response = await fetch("/api/weather");
        const data = (await response.json()) as WeatherResponse;
        setTemperature(String(data.temperature ?? "--"));
        setWind(String(data.windspeed ?? "--"));
      } catch {
        setTemperature("--");
        setWind("--");
      }
    }
    run();
  }, []);

  return (
    <article className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
      <h2 className="text-lg font-semibold">Track Weather</h2>
      <p className="mt-2 text-sm text-zinc-300">Temperature: {temperature} C</p>
      <p className="text-sm text-zinc-300">Wind: {wind} km/h</p>
    </article>
  );
}
