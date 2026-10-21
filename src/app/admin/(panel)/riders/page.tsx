import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintButton, DayPicker } from "@/components/admin/riders-toolbar";
import { getFocusDay, getRoster } from "@/lib/admin/roster";
import { getSchedule } from "@/lib/park/live";
import { formatDay, formatTimeRange } from "@/lib/park/format";

export const metadata: Metadata = { title: "Riders" };

export default async function RidersPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const [{ date: requested }, schedule, focus] = await Promise.all([searchParams, getSchedule(), getFocusDay()]);
  const date = schedule.some((d) => d.date === requested) ? requested! : (focus.day?.date ?? schedule.at(-1)?.date);
  if (!date) {
    return <p className="text-muted-foreground">No ride days yet.</p>;
  }
  const day = schedule.find((d) => d.date === date)!;
  const { riders, classes } = await getRoster(date);
  const options = [...schedule].reverse().map((d) => ({ value: d.date, label: `${formatDay(d.date)}${d.cancelled ? " (cancelled)" : ""}` }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 print:max-w-none">
      <header className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Riders</h1>
          <p className="mt-1 text-muted-foreground">Paid online registrations, grouped by class.</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <DayPicker value={date} options={options} />
          <PrintButton />
          <Button asChild variant="outline" className="h-11 flex-1 bg-card sm:flex-none">
            <a href={`/admin/export?date=${date}`}>
              <Download /> CSV
            </a>
          </Button>
        </div>
      </header>

      {/* Print header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">Martin MX · {formatDay(date, "long")}</h1>
        <p className="text-sm">
          {day.title} · {formatTimeRange(day.start, day.end)} · {riders.length} riders
        </p>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <span className="rounded-full bg-ink px-3.5 py-1.5 text-sm font-semibold text-white">{riders.length} total</span>
        {classes.map((c) => (
          <span key={c.id} className="rounded-full border bg-card px-3.5 py-1.5 text-sm font-semibold">
            {c.label} {c.paid}
          </span>
        ))}
      </div>

      {riders.length === 0 && (
        <div className="rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">No paid registrations for this day.</div>
      )}

      {classes
        .filter((c) => c.paid > 0)
        .map((c) => {
          const list = riders.filter((r) => r.classId === c.id);
          return (
            <section key={c.id} className="break-inside-avoid">
              <h2 className="mb-2 text-lg font-bold">
                {c.label} <span className="font-normal text-muted-foreground">· {list.length}</span>
              </h2>
              {/* Phone: cards. Desktop + print: table. */}
              <ul className="divide-y rounded-lg border bg-card md:hidden print:hidden">
                {list.map((r) => (
                  <li key={r.id} className="flex items-center gap-4 px-4 py-3">
                    <span className="w-10 text-center font-display text-xl font-bold italic">{r.riderNumber}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{r.name}</span>
                      <span className="block text-sm text-muted-foreground">
                        {r.bikeSize}cc · {r.ageGroup === "minor" ? "Minor" : "Adult"} ·{" "}
                        <a href={`tel:${r.phone}`} className="underline">
                          {r.phone}
                        </a>
                      </span>
                    </span>
                    {r.checkedIn && <span className="text-xs font-bold uppercase text-brand">In</span>}
                  </li>
                ))}
              </ul>
              <table className="hidden w-full overflow-hidden rounded-lg border bg-card text-left text-sm md:table print:table print:text-xs">
                <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="w-8 px-3 py-2 print:px-2">In</th>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2">Age</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2 print:hidden">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {list.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2 print:px-2">{r.checkedIn ? "✓" : "☐"}</td>
                      <td className="px-3 py-2 font-bold tabular-nums">{r.riderNumber}</td>
                      <td className="px-3 py-2 font-semibold">{r.name}</td>
                      <td className="px-3 py-2 tabular-nums">{r.bikeSize}cc</td>
                      <td className="px-3 py-2">{r.ageGroup === "minor" ? "Minor" : "Adult"}</td>
                      <td className="px-3 py-2 tabular-nums">{r.phone}</td>
                      <td className="px-3 py-2 print:hidden">{r.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}
    </div>
  );
}
