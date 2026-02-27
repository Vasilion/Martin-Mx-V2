import { ScheduleCalendar } from "@/components/schedule-calendar";
import { getScheduleEvents } from "@/lib/content/loader";

export default async function SchedulePage() {
  const events = await getScheduleEvents();
  return (
    <section className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <h1 className="text-3xl font-bold md:text-4xl">Schedule</h1>
        <p className="mt-2 text-sm text-zinc-300 md:text-base">
          Browse upcoming practice windows by month. Open events link directly to registration.
        </p>
      </header>
      <ScheduleCalendar events={events} />
    </section>
  );
}
