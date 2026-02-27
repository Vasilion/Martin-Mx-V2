import Image from "next/image";
import Link from "next/link";
import { ScheduleCalendar } from "@/components/schedule-calendar";
import { getScheduleEvents } from "@/lib/content/loader";

export default async function SchedulePage() {
  const events = await getScheduleEvents();
  const upcomingCount = events.filter((event) => !event.isCancelled).length;
  const cancelledCount = events.filter((event) => event.isCancelled).length;
  return (
    <section className="space-y-6 text-white">
      <header className="mx-glow-card relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="mx-grid-overlay pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(51,142,0,0.2),transparent_48%)]" />
        <div className="relative grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Ride Calendar</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Schedule</h1>
            <p className="mt-2 text-sm text-zinc-300 md:text-base">
              Browse upcoming practice windows by month. Open events link directly to registration.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/register#practice-signup"
                className="mx-cta-primary px-4 py-2 text-sm"
              >
                Register for Practice
              </Link>
              <Link
                href="/register#membership-signup"
                className="mx-cta-secondary px-4 py-2 text-sm"
              >
                Membership Signup
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <article className="rounded-2xl border border-zinc-700/80 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Open Events</p>
              <p className="mt-2 text-2xl font-bold text-green-300">{upcomingCount}</p>
            </article>
            <article className="rounded-2xl border border-zinc-700/80 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Cancelled</p>
              <p className="mt-2 text-2xl font-bold text-red-300">{cancelledCount}</p>
            </article>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Planning Window", value: "Monthly" },
          { label: "Event Visibility", value: "Live CMS" },
          { label: "Signup Flow", value: "Direct Linked" },
        ].map((item) => (
          <article
            key={item.label}
            className="mx-card-interactive rounded-2xl border border-white/10 bg-zinc-900/75 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.3)]"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{item.label}</p>
            <p className="mt-2 text-2xl font-bold">{item.value}</p>
          </article>
        ))}
      </section>

      <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[0_14px_40px_rgba(0,0,0,0.3)]">
        <div className="relative aspect-[16/7] w-full bg-zinc-800 md:aspect-[16/6]">
          <Image
            src="/media/gallery/strapi-gallery-5.jpg"
            alt="Schedule and session planning visual"
            fill
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-cover"
          />
        </div>
      </article>

      <ScheduleCalendar events={events} />
    </section>
  );
}
