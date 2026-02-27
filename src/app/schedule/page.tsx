import { ScheduleCalendar } from "@/components/schedule-calendar";
import { getScheduleEvents } from "@/lib/content/loader";

export default async function SchedulePage() {
  const events = await getScheduleEvents();
  return (
    <section className="space-y-4 text-white">
      <h1 className="text-3xl font-bold">Schedule</h1>
      <ScheduleCalendar events={events} />
    </section>
  );
}
