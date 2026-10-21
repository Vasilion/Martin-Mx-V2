import type { Metadata } from "next";
import { ScheduleManager } from "@/components/admin/schedule-manager";
import { getPractice, getSchedule, parkNow } from "@/lib/park/live";
import { getStore } from "@/lib/registrations/store";

export const metadata: Metadata = { title: "Schedule" };

export default async function AdminSchedulePage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const [{ new: startNew }, schedule, practice] = await Promise.all([searchParams, getSchedule(), getPractice()]);
  const { date: today } = parkNow();
  const upcoming = schedule.filter((d) => d.date >= today);
  const past = schedule.filter((d) => d.date < today).reverse().slice(0, 30);

  const store = getStore();
  const registered = Object.fromEntries(
    await Promise.all(
      [...upcoming, ...past].map(async (d) => [d.date, (await store.listByDay(d.date)).filter((r) => r.status === "paid").length] as const),
    ),
  );
  const first = practice.hours[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Schedule</h1>
        <p className="mt-1 text-muted-foreground">Ride days, cancellations and online registration. Changes show on the site immediately.</p>
      </header>
      <ScheduleManager
        upcoming={upcoming}
        past={past}
        today={today}
        registered={registered}
        defaults={{ start: first?.open ?? "10:00", end: first?.close ?? "15:00" }}
        startOpen={startNew === "1"}
      />
    </div>
  );
}
