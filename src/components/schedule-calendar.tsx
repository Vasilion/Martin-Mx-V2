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
          className="rounded-xl border border-zinc-600 bg-zinc-900/70 px-3 py-2 text-sm transition hover:border-zinc-400"
          onClick={() => {
            const idx = Math.max(0, orderedMonths.indexOf(activeMonth) - 1);
            setActiveMonth(orderedMonths[idx]);
          }}
        >
          Previous
        </button>
        <p className="text-lg font-semibold tracking-tight">{formatMonthLabel(monthDate)}</p>
        <button
          type="button"
          className="rounded-xl border border-zinc-600 bg-zinc-900/70 px-3 py-2 text-sm transition hover:border-zinc-400"
          onClick={() => {
            const idx = Math.min(orderedMonths.length - 1, orderedMonths.indexOf(activeMonth) + 1);
            setActiveMonth(orderedMonths[idx]);
          }}
        >
          Next
        </button>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 text-xs text-zinc-300">
          <span className="rounded-lg bg-zinc-800 px-2 py-1">Scheduled Practice</span>
          <span className="rounded-lg bg-green-900/40 px-2 py-1 text-green-300">Registration Open</span>
          <span className="rounded-lg bg-red-900/40 px-2 py-1 text-red-300">Practice Cancelled</span>
        </div>
        {selectedEvents.length === 0 ? (
          <article className="rounded-2xl border border-white/10 bg-zinc-900/75 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
            <p className="text-sm text-zinc-300">No events in this month.</p>
          </article>
        ) : (
          selectedEvents
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((event) => (
              <article
                key={event.id}
                className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur"
              >
                <h2 className="text-lg font-semibold">{event.title}</h2>
                <p className="mt-1 text-sm text-zinc-300">
                  {formatDay(new Date(event.date))} {event.startTime}-{event.endTime}
                </p>
                <p className={`mt-1 text-sm ${event.isCancelled ? "text-red-300" : "text-green-300"}`}>
                  {event.isCancelled ? "Cancelled" : "Open"}
                </p>
                {!event.isCancelled ? (
                  <a
                    href="/register"
                    className="mt-3 inline-block rounded-xl bg-gradient-to-r from-green-700 to-green-600 px-3 py-1.5 text-xs font-medium"
                  >
                    Sign Up
                  </a>
                ) : null}
              </article>
            ))
        )}
      </div>
    </div>
  );
}
