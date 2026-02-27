"use client";

import { useMemo, useState } from "react";
import type { ScheduleEvent } from "@/lib/content/schemas";

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function formatDay(date: Date) {
  return date.toLocaleString("en-US", { month: "short", day: "numeric" });
}

type Props = {
  events: ScheduleEvent[];
};

export function ScheduleCalendar({ events }: Props) {
  const [activeMonth, setActiveMonth] = useState(() => toMonthKey(new Date()));

  const grouped = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    events.forEach((event) => {
      const key = toMonthKey(new Date(event.date));
      map.set(key, [...(map.get(key) ?? []), event]);
    });
    return map;
  }, [events]);

  const orderedMonths = useMemo(() => {
    const months = new Set<string>([activeMonth]);
    grouped.forEach((_, key) => months.add(key));
    return Array.from(months).sort();
  }, [activeMonth, grouped]);

  const selectedEvents = grouped.get(activeMonth) ?? [];
  const monthDate = new Date(`${activeMonth}-01T00:00:00`);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded border border-zinc-700 px-3 py-2 text-sm"
          onClick={() => {
            const idx = Math.max(0, orderedMonths.indexOf(activeMonth) - 1);
            setActiveMonth(orderedMonths[idx]);
          }}
        >
          Previous
        </button>
        <p className="text-lg font-semibold">{formatMonthLabel(monthDate)}</p>
        <button
          type="button"
          className="rounded border border-zinc-700 px-3 py-2 text-sm"
          onClick={() => {
            const idx = Math.min(orderedMonths.length - 1, orderedMonths.indexOf(activeMonth) + 1);
            setActiveMonth(orderedMonths[idx]);
          }}
        >
          Next
        </button>
      </div>
      <div className="space-y-3">
        {selectedEvents.length === 0 ? (
          <article className="rounded border border-zinc-700 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-300">No events in this month.</p>
          </article>
        ) : (
          selectedEvents
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((event) => (
              <article key={event.id} className="rounded border border-zinc-700 bg-zinc-900 p-4">
                <h2 className="text-lg font-semibold">{event.title}</h2>
                <p className="text-sm text-zinc-300">
                  {formatDay(new Date(event.date))} {event.startTime}-{event.endTime}
                </p>
                <p className={`text-sm ${event.isCancelled ? "text-red-300" : "text-green-300"}`}>
                  {event.isCancelled ? "Cancelled" : "Open"}
                </p>
              </article>
            ))
        )}
      </div>
    </div>
  );
}
