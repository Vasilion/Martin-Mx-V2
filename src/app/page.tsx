import Link from "next/link";
import Script from "next/script";
import { WeatherCard } from "@/components/weather-card";
import {
  getAnnouncements,
  getHomeContent,
  getOperationsContent,
  getSiteSettings,
} from "@/lib/content/loader";

type PracticeSession = {
  label: string;
  date: string;
  startTime: string;
  endTime: string;
};

function getSessionStartValue(session: PracticeSession) {
  return Date.parse(`${session.date}T${session.startTime}:00`);
}

export default async function Home() {
  const [home, settings, operations, rawAnnouncements] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
    getOperationsContent(),
    getAnnouncements(),
  ]);
  const announcements = rawAnnouncements.filter((item) => item.active);
  const sortedSessions = operations.practiceSessions
    .slice()
    .sort((a, b) => getSessionStartValue(a) - getSessionStartValue(b));
  const nextSession = sortedSessions[0] ?? null;

  return (
    <section className="space-y-8 md:space-y-10">
      <Script
        id="martinmx-ld-json"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsActivityLocation",
            name: settings.siteName,
            address: settings.address,
            email: settings.contactEmail,
            telephone: settings.contactPhone,
          }),
        }}
      />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 p-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur md:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.26),transparent_42%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-300">{settings.siteName}</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">{home.heroTitle}</h1>
          <p className="mt-4 max-w-2xl text-zinc-200/90 md:text-lg">{home.heroDescription}</p>
        </div>
        <div className="relative mt-7 flex flex-wrap gap-3">
          <Link
            href={home.heroCtaHref}
            className="rounded-xl bg-gradient-to-r from-green-700 to-green-600 px-5 py-2.5 font-semibold text-white transition hover:from-green-600 hover:to-green-500"
          >
            {home.heroCtaLabel}
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-zinc-500 bg-zinc-900/50 px-5 py-2.5 font-medium transition hover:border-zinc-300"
          >
            Register Now
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {home.features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 text-white shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur"
          >
            <h2 className="text-lg font-semibold tracking-tight">{feature.title}</h2>
            <p className="mt-2 text-sm text-zinc-200/80">{feature.description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
          <h2 className="text-xl font-semibold">Operations Snapshot</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Practice</p>
              <p
                className={`mt-2 inline-block rounded px-2 py-1 text-xs font-semibold ${
                  settings.practiceOpen ? "bg-green-700/20 text-green-300" : "bg-zinc-700/40 text-zinc-300"
                }`}
              >
                {settings.practiceOpen ? "Open" : "Closed"}
              </p>
              <p className="mt-2 text-sm text-zinc-200">{operations.practiceStatusLabel}</p>
              <Link
                href="/register#practice-signup"
                className="mt-3 inline-block rounded-xl bg-gradient-to-r from-green-700 to-green-600 px-3 py-2 text-sm font-medium transition hover:from-green-600 hover:to-green-500"
              >
                {operations.practiceCtaLabel}
              </Link>
            </div>
            <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Membership</p>
              <p
                className={`mt-2 inline-block rounded px-2 py-1 text-xs font-semibold ${
                  settings.membershipOpen ? "bg-green-700/20 text-green-300" : "bg-zinc-700/40 text-zinc-300"
                }`}
              >
                {settings.membershipOpen ? "Open" : "Closed"}
              </p>
              <p className="mt-2 text-sm text-zinc-200">{operations.membershipStatusLabel}</p>
              <Link
                href="/register#membership-signup"
                className="mt-3 inline-block rounded-xl border border-zinc-500 bg-zinc-900/60 px-3 py-2 text-sm font-medium transition hover:border-zinc-300"
              >
                {operations.membershipCtaLabel}
              </Link>
            </div>
          </div>
          {nextSession ? (
            <div className="mt-4 rounded-2xl border border-zinc-700/80 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Next Session</p>
              <p className="mt-2 text-sm text-zinc-100">
                {nextSession.label}: {nextSession.date} {nextSession.startTime}-{nextSession.endTime}
              </p>
            </div>
          ) : null}
          {settings.practiceCancelled ? (
            <p className="mt-2 text-sm text-red-300">Cancellation: {settings.practiceCancelReason}</p>
          ) : null}
          {operations.practiceCashOnly ? (
            <p className="mt-2 text-sm text-amber-300">Practice sessions are currently cash only.</p>
          ) : null}
          {operations.practiceSessions.length > 0 ? (
            <div className="mt-3 space-y-1 text-xs text-zinc-400">
              {sortedSessions.map((session) => (
                <p key={session.label}>
                  {session.label}: {session.date} {session.startTime}-{session.endTime}
                </p>
              ))}
            </div>
          ) : null}
          <p className="mt-3 text-sm text-zinc-400">{settings.tagline}</p>
          <a className="mt-3 inline-block text-sm text-green-300 underline" href={settings.storeLink}>
            Visit Merch Store
          </a>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/schedule" className="rounded-xl bg-zinc-800 px-3 py-2 text-sm transition hover:bg-zinc-700">
              View Schedule
            </Link>
            <Link href="/contact" className="rounded-xl bg-zinc-800 px-3 py-2 text-sm transition hover:bg-zinc-700">
              Contact Park
            </Link>
          </div>
        </div>
        <WeatherCard />
      </div>

      {announcements.length > 0 ? (
        <section className="space-y-3">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className={`rounded-2xl border p-4 text-sm shadow-[0_12px_30px_rgba(0,0,0,0.25)] ${
                announcement.severity === "warning"
                  ? "border-amber-700 bg-amber-900/20 text-amber-100"
                  : announcement.severity === "success"
                    ? "border-green-700 bg-green-900/20 text-green-100"
                    : "border-zinc-700 bg-zinc-900 text-zinc-200"
              }`}
            >
              <p className="font-semibold">{announcement.title}</p>
              <p className="mt-1">{announcement.message}</p>
            </article>
          ))}
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-zinc-900/75 p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
          <h2 className="text-xl font-semibold">{home.trackMapTitle}</h2>
          <p className="mt-2 text-sm text-zinc-200/85">{home.trackMapDescription}</p>
          <div className="mt-4 aspect-video overflow-hidden rounded-2xl border border-zinc-700">
            <iframe
              title={home.trackMapTitle}
              src={home.trackMapEmbedUrl}
              className="h-full w-full"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              loading="lazy"
            />
          </div>
        </article>
        <article className="rounded-3xl border border-white/10 bg-zinc-900/75 p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
          <h2 className="text-xl font-semibold">{home.videoTitle}</h2>
          <p className="mt-2 text-sm text-zinc-200/85">{home.videoDescription}</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-700">
            <video controls preload="none" className="w-full" src={home.trackVideoUrl} />
          </div>
        </article>
      </div>
    </section>
  );
}
