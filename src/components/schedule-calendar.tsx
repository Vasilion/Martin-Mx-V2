"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { ScheduleEvent } from "@/lib/content/schemas";
import { formatDateMMDDYYYY, formatTimeRangeEST } from "@/lib/datetime-format";

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

type Props = {
  events: ScheduleEvent[];
};

const eventImagePool = [
  "/media/gallery/strapi-main-1.jpg",
  "/media/gallery/strapi-main-2.jpg",
  "/media/gallery/strapi-main-3.jpg",
  "/media/gallery/strapi-youth-1.jpg",
  "/media/gallery/strapi-youth-2.jpg",
];

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

  const selectedEvents = useMemo(() => grouped.get(activeMonth) ?? [], [activeMonth, grouped]);
  const monthDate = new Date(`${activeMonth}-01T00:00:00`);
  const monthEventMap = useMemo(() => {
    const map = new Map<number, ScheduleEvent[]>();
    selectedEvents.forEach((event) => {
      const day = new Date(event.date).getDate();
      map.set(day, [...(map.get(day) ?? []), event]);
    });
    return map;
  }, [selectedEvents]);
  const dayCount = getDaysInMonth(monthDate);
  const firstWeekday = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: dayCount }, (_, index) => index + 1),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="mx-cta-secondary px-3 py-2 text-sm"
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
          className="mx-cta-secondary px-3 py-2 text-sm"
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
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
          <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950/60 text-center text-xs uppercase tracking-wide text-zinc-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayLabel) => (
              <p key={dayLabel} className="py-2">
                {dayLabel}
              </p>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarCells.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="min-h-[90px] border border-zinc-900/70 bg-zinc-950/35" />;
              }
              const dayEvents = monthEventMap.get(day) ?? [];
              const hasCancelled = dayEvents.some((event) => event.isCancelled);
              const hasOpen = dayEvents.some((event) => !event.isCancelled);
              return (
                <div key={day} className="min-h-[90px] border border-zinc-900/70 bg-zinc-900/40 p-2">
                  <p className="text-xs font-semibold text-zinc-200">{day}</p>
                  <div className="mt-1 space-y-1">
                    {hasOpen ? <div className="h-1.5 w-7 rounded-full bg-green-500/85" /> : null}
                    {hasCancelled ? <div className="h-1.5 w-7 rounded-full bg-red-500/85" /> : null}
                    {dayEvents.length > 0 ? <p className="text-[10px] text-zinc-400">{dayEvents.length} event(s)</p> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </article>
        {selectedEvents.length === 0 ? (
          <article className="rounded-2xl border border-white/10 bg-zinc-900/75 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
            <p className="text-sm text-zinc-300">No events in this month.</p>
          </article>
        ) : (
          selectedEvents
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((event, index) => (
              <article
                key={event.id}
                className="mx-card-interactive rounded-2xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur"
              >
                <div className="relative mb-3 aspect-[16/8] w-full overflow-hidden rounded-xl bg-zinc-800 md:aspect-[16/7]">
                  <Image
                    src={eventImagePool[index % eventImagePool.length]}
                    alt={`${event.title} event preview`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 70vw"
                    className="object-cover"
                  />
                </div>
                <h2 className="text-lg font-semibold">{event.title}</h2>
                <p className="mt-1 text-sm text-zinc-300">
                  {formatDateMMDDYYYY(event.date)} {formatTimeRangeEST(event.startTime, event.endTime)}
                </p>
                <p className={`mt-1 text-sm ${event.isCancelled ? "text-red-300" : "text-green-300"}`}>
                  {event.isCancelled ? "Cancelled" : "Open"}
                </p>
                {!event.isCancelled ? (
                  <a
                    href="/register"
                    className="mx-cta-primary mt-3 inline-block px-3 py-1.5 text-xs"
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
