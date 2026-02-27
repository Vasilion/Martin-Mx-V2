import Image from "next/image";
import Link from "next/link";
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
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/register#practice-signup" className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white">
            Register for Practice
          </Link>
          <Link href="/register#membership-signup" className="rounded-xl border border-zinc-500 px-4 py-2 text-sm font-semibold text-zinc-200">
            Membership Signup
          </Link>
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
            className="rounded-2xl border border-white/10 bg-zinc-900/75 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.3)]"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{item.label}</p>
            <p className="mt-2 text-2xl font-bold">{item.value}</p>
          </article>
        ))}
      </section>

      <article className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[0_14px_40px_rgba(0,0,0,0.3)]">
        <div className="relative aspect-[16/6] w-full bg-zinc-800">
          <Image
            src="/media/gallery/strapi-gallery-5.jpg"
            alt="Schedule and session planning visual"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </article>

      <ScheduleCalendar events={events} />
    </section>
  );
}
