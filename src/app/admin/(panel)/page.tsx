import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayControls } from "@/components/admin/day-controls";
import { RiderList } from "@/components/admin/rider-list";
import { getFocusDay, getRoster } from "@/lib/admin/roster";
import { formatDay, formatPrice, formatTimeRange } from "@/lib/park/format";

export const metadata: Metadata = { title: "Today" };

export default async function TodayPage() {
  const { day, isToday } = await getFocusDay();

  if (!day) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Nothing scheduled</h1>
        <p className="mt-2 text-muted-foreground">There are no upcoming ride days. Add one and it shows up on the site right away.</p>
        <Button asChild className="mt-6 h-12 px-5 text-base">
          <Link href="/admin/schedule?new=1">
            <CalendarPlus /> Add a ride day
          </Link>
        </Button>
      </div>
    );
  }

  const { riders, classes, revenue } = await getRoster(day.date);
  const checkedIn = riders.filter((r) => r.checkedIn).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">{isToday ? "Today" : "Next ride day"}</p>
        <h1 className="mt-1 text-3xl font-bold leading-tight md:text-4xl">{formatDay(day.date, "long")}</h1>
        <p className="mt-1 text-muted-foreground">
          {day.title} · {formatTimeRange(day.start, day.end)}
        </p>
      </header>

      <DayControls day={day} registered={riders.length} />

      <section aria-label="Totals" className="grid grid-cols-3 gap-3">
        {[
          { label: "Registered", value: riders.length },
          { label: "Checked in", value: `${checkedIn}/${riders.length}` },
          { label: "Paid online", value: formatPrice(revenue) },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums md:text-3xl">{s.value}</p>
          </div>
        ))}
      </section>

      <section aria-label="Spots by class" className="rounded-lg border bg-card p-4">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4">
          {classes.map((c) => {
            const pct = Math.min(100, Math.round(((c.paid + c.held) / c.capacity) * 100));
            return (
              <li key={c.id}>
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{c.label}</span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {c.paid}/{c.capacity}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className={pct >= 100 ? "h-full bg-destructive" : "h-full bg-brand"} style={{ width: `${pct}%` }} />
                </div>
                {c.held > 0 && <p className="mt-1 text-xs text-muted-foreground">{c.held} paying now</p>}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="riders-heading">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 id="riders-heading" className="text-xl font-bold">
            Riders
          </h2>
          <Button asChild variant="outline" className="h-10 bg-card">
            <Link href={`/admin/riders?date=${day.date}`}>
              <Printer /> Print / export
            </Link>
          </Button>
        </div>
        <RiderList riders={riders} classes={classes} />
      </section>
    </div>
  );
}
