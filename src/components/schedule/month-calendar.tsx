"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { RideDay } from "@/lib/park/live";
import { formatTimeRange } from "@/lib/park/format";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ym(iso: string) {
  return { y: Number(iso.slice(0, 4)), m: Number(iso.slice(5, 7)) - 1 };
}
function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Month grid. Starts on the month of the next ride day so it's never an empty screen. */
export function MonthCalendar({ days, today, startMonth }: { days: RideDay[]; today: string; startMonth: string }) {
  const [cursor, setCursor] = useState(() => ym(startMonth));
  const [selected, setSelected] = useState<string | null>(null);
  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  const first = new Date(Date.UTC(cursor.y, cursor.m, 1));
  const daysInMonth = new Date(Date.UTC(cursor.y, cursor.m + 1, 0)).getUTCDate();
  const lead = first.getUTCDay();
  const label = first.toLocaleDateString("en-US", { timeZone: "UTC", month: "long", year: "numeric" });
  const selectedDay = selected ? byDate.get(selected) : undefined;

  const shift = (delta: number) => {
    setSelected(null);
    setCursor(({ y, m }) => {
      const d = new Date(Date.UTC(y, m + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });
  };

  return (
    <div className="rounded-sm border border-white/10 bg-ink-2 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h3 className="display text-3xl text-white sm:text-4xl md:text-5xl">{label}</h3>
        <div className="flex gap-2">
          <Button variant="race-outline" size="icon-lg" onClick={() => shift(-1)} aria-label="Previous month">
            <ChevronLeft />
          </Button>
          <Button variant="race-outline" size="icon-lg" onClick={() => shift(1)} aria-label="Next month">
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1 md:gap-2" role="grid" aria-label={label}>
        {weekdays.map((w) => (
          <div key={w} className="eyebrow pb-2 text-center text-[0.65rem] tracking-[0.08em] text-white/45 sm:tracking-[0.2em]" role="columnheader">
            {w}
          </div>
        ))}
        {Array.from({ length: lead }).map((_, i) => (
          <div key={`lead-${i}`} aria-hidden />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = iso(cursor.y, cursor.m, i + 1);
          const ride = byDate.get(date);
          const isPast = date < today;
          return (
            <button
              key={date}
              type="button"
              role="gridcell"
              disabled={!ride}
              onClick={() => setSelected(date === selected ? null : date)}
              aria-label={ride ? `${date}: ${ride.cancelled ? "cancelled" : ride.title}` : date}
              aria-pressed={selected === date}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-sm text-sm transition md:text-base",
                !ride && "text-white/30",
                ride && !ride.cancelled && "bg-brand/25 font-semibold text-white hover:bg-brand/50",
                ride?.cancelled && "bg-danger/15 text-danger line-through",
                ride && isPast && "opacity-45",
                date === today && "ring-2 ring-volt ring-offset-2 ring-offset-ink-2",
                selected === date && "bg-volt text-ink hover:bg-volt",
              )}
            >
              {i + 1}
              {ride && !ride.cancelled && selected !== date && (
                <span className="absolute bottom-1.5 size-1 rounded-full bg-volt md:bottom-2" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 min-h-14 border-t border-white/10 pt-4 text-sm" aria-live="polite">
        {selectedDay ? (
          <p className="text-white">
            <span className="font-semibold">{selectedDay.title}</span> ·{" "}
            {selectedDay.cancelled ? (
              <span className="text-danger">Cancelled{selectedDay.cancelReason ? ` — ${selectedDay.cancelReason}` : ""}</span>
            ) : (
              formatTimeRange(selectedDay.start, selectedDay.end)
            )}
          </p>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/55">
            <span className="flex items-center gap-2"><span className="size-3 rounded-sm bg-brand/50" /> Ride day</span>
            <span className="flex items-center gap-2"><span className="size-3 rounded-sm bg-danger/40" /> Cancelled</span>
            <span className="flex items-center gap-2"><span className="size-3 rounded-sm ring-2 ring-volt" /> Today</span>
          </div>
        )}
      </div>
    </div>
  );
}
