import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintButton, DayPicker } from "@/components/admin/riders-toolbar";
import { RiderList } from "@/components/admin/rider-list";
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
          <p className="mt-1 text-muted-foreground">Paid online registrations, A to Z by last name. Print groups them by class.</p>
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

      <div className="print:hidden">
        <RiderList riders={riders} classes={classes} />
      </div>

      {classes
        .filter((c) => c.paid > 0)
        .map((c) => {
          const list = riders.filter((r) => r.classId === c.id);
          return (
            <section key={c.id} className="hidden break-inside-avoid print:block">
              <h2 className="mb-2 text-lg font-bold">
                {c.label} <span className="font-normal text-muted-foreground">· {list.length}</span>
              </h2>
              <table className="w-full overflow-hidden rounded-lg border bg-card text-left text-xs">
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
