"use client";

import { useEffect, useState } from "react";

type WeatherResponse = {
  current_weather?: {
    temperature: number;
    windspeed: number;
  };
};

export function WeatherCard() {
  const [temperature, setTemperature] = useState<string>("--");
  const [wind, setWind] = useState<string>("--");

  useEffect(() => {
    async function run() {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=42.54&longitude=-85.64&current_weather=true",
        );
        const data = (await response.json()) as WeatherResponse;
        setTemperature(String(data.current_weather?.temperature ?? "--"));
        setWind(String(data.current_weather?.windspeed ?? "--"));
      } catch {
        setTemperature("--");
        setWind("--");
      }
    }
    run();
  }, []);

  return (
    <article className="rounded border border-zinc-700 bg-zinc-900 p-4 text-white">
      <h2 className="text-lg font-semibold">Track Weather</h2>
      <p className="mt-2 text-sm text-zinc-300">Temperature: {temperature} C</p>
      <p className="text-sm text-zinc-300">Wind: {wind} km/h</p>
    </article>
  );
}
