import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/site/page-header";
import { RideDayRow } from "@/components/schedule/ride-day-row";
import { MonthCalendar } from "@/components/schedule/month-calendar";
import { Reveal } from "@/components/motion/reveal";
import { getPractice, getSchedule, parkNow, resolveTrackStatus } from "@/lib/park/live";
import { getWeather } from "@/lib/park/weather";
import { formatDay, formatTime, formatTimeRange } from "@/lib/park/format";
import { park } from "@/lib/park/facts";

export const metadata: Metadata = pageMetadata({
  title: "Schedule",
  description:
    "Upcoming open practice days, hours, live track status and cancellations at Martin MX Park in Martin, Michigan.",
  path: "/schedule",
  og: "schedule",
});

// Owner edits in the dashboard must show immediately; data is a couple of DynamoDB reads.
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const [schedule, practice, weather] = await Promise.all([getSchedule(), getPractice(), getWeather()]);
  const { date: today } = parkNow();
  const status = resolveTrackStatus(schedule);
  const upcoming = schedule.filter((d) => d.date >= today);
  const forecastFor = (date: string) => weather?.days.find((d) => d.date === date);

  const headline =
    status.kind === "riding-now"
      ? `Open now until ${formatTime(status.day.end)}.`
      : status.kind === "today"
        ? `Riding today, ${formatTimeRange(status.day.start, status.day.end)}.`
        : status.kind === "cancelled"
          ? `Today's practice is cancelled${status.day.cancelReason ? `: ${status.day.cancelReason}` : "."}`
          : status.kind === "upcoming"
            ? `Next ride day: ${formatDay(status.day.date, "long")}, ${formatTimeRange(status.day.start, status.day.end)}.`
            : "The season's wrapped. New dates post here first.";

  return (
    <>
      <PageHeader
        eyebrow="Ride calendar"
        title="Schedule"
        image="/photos/roost-yellow.jpg"
        imagePosition="center 40%"
        intro={
          <p>
            <span className="font-semibold text-white">{headline}</span> Days can change with weather and track
            conditions. Cancellations show up here the moment we post them.
          </p>
        }
      />

      <section className="bg-ink pb-24 md:pb-32">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-4 md:px-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="eyebrow text-white/50">Upcoming ride days</h2>
            </Reveal>
            {upcoming.length > 0 ? (
              <ul className="mt-4 border-t border-white/10">
                {upcoming.map((day) => (
                  <RideDayRow key={day.id} day={day} isToday={day.date === today} forecast={forecastFor(day.date)} />
                ))}
              </ul>
            ) : (
              <div className="mt-6 rounded-sm border border-white/10 bg-ink-2 p-8">
                <p className="display text-4xl text-white">Nothing on the books yet.</p>
                <p className="mt-3 text-white/65">
                  New ride days post here and on{" "}
                  <a href={park.social.facebook} target="_blank" rel="noreferrer" className="text-volt underline-offset-4 hover:underline">
                    Facebook
                  </a>
                  . Regular hours are below.
                </p>
              </div>
            )}

            <div className="mt-14">
              <h2 className="eyebrow text-white/50">Regular hours</h2>
              <ul className="mt-4 grid gap-px overflow-hidden rounded-sm bg-white/10 sm:grid-cols-3">
                {practice.hours.map((h) => (
                  <li key={h.day} className="bg-ink-2 p-5">
                    <p className="font-display text-2xl font-bold uppercase italic text-white">{h.day}</p>
                    <p className="mt-1 text-white/65">{formatTimeRange(h.open, h.close)}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-white/50">{practice.hoursNote}</p>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <MonthCalendar days={schedule} today={today} startMonth={upcoming[0]?.date ?? today} />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
