import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import { WeatherCard } from "@/components/weather-card";
import { InteractiveGallery } from "@/components/interactive-gallery";
import {
  getHomeContent,
  getOperationsContent,
  getSiteSettings,
} from "@/lib/content/loader";
import { formatDateMMDDYYYY, formatTimeRangeEST } from "@/lib/datetime-format";

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
  const [home, settings, operations] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
    getOperationsContent(),
  ]);
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
      <div className="mx-glow-card relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/75 p-6 text-white md:p-8">
        <div className="absolute inset-0">
          <Image src="/media/gallery/hero.webp" alt="Martin MX hero rider" fill sizes="100vw" className="object-cover opacity-35" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(51,142,0,0.25),transparent_40%)]" />
        <div className="relative grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-green-300/85">Welcome To The Track</p>
            <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">{home.heroTitle}</h1>
            <p className="mt-4 max-w-2xl text-zinc-200 md:text-lg">{home.heroDescription}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={home.heroCtaHref} className="mx-cta-primary px-5 py-2.5">
                {home.heroCtaLabel}
              </Link>
              <Link href="/register" className="mx-cta-secondary border-white/60 bg-black/35 px-5 py-2.5">
                Register Now
              </Link>
              <div className="ml-1 rounded-xl border border-green-500/40 bg-black/55 px-4 py-2">
                <p className="text-xl font-bold leading-none text-green-300">200k+</p>
                <p className="text-xs uppercase tracking-wide text-zinc-200">Satisfied Riders</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <article className="rounded-2xl border border-white/15 bg-black/45 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Track Status</p>
              <p className="mt-2 text-lg font-bold text-green-300">{settings.practiceOpen ? "Open For Practice" : "Currently Closed"}</p>
              <p className="mt-1 text-sm text-zinc-200">{settings.practiceCancelled ? settings.practiceCancelReason : operations.practiceStatusLabel}</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-black/45 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Next Session</p>
              <p className="mt-2 text-sm text-zinc-100">
                {nextSession
                  ? `${nextSession.label}: ${formatDateMMDDYYYY(nextSession.date)} ${formatTimeRangeEST(nextSession.startTime, nextSession.endTime)}`
                  : "No upcoming sessions set"}
              </p>
            </article>
          </div>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Practice Windows", value: "3x Weekly" },
          { label: "Track Experience", value: "Main + Junior" },
          { label: "Rider Community", value: "200k+" },
          { label: "Location", value: "Martin, MI" },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 text-white shadow-[0_14px_40px_rgba(0,0,0,0.3)]"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{item.label}</p>
            <p className="mt-2 text-2xl font-bold leading-none">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Featured Track Media</h2>
          <Link href="/gallery" className="mx-cta-primary px-4 py-2 text-sm">
            Open Full Gallery
          </Link>
        </div>
        <InteractiveGallery
          columns={3}
          showMeta={false}
          items={[
            {
              id: "home-feature-1",
              title: "Main Track Charge",
              image: "/media/gallery/strapi-gallery-1.jpg",
              alt: "Main track rider cornering",
              isFeatured: true,
            },
            {
              id: "home-feature-2",
              title: "Mid-Corner Drive",
              image: "/media/gallery/strapi-gallery-3.jpg",
              alt: "Rider action on track section",
            },
            {
              id: "home-feature-3",
              title: "Rhythm Lane Pace",
              image: "/media/gallery/strapi-gallery-6.jpg",
              alt: "Practice rhythm lane action",
            },
          ]}
        />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
          <h2 className="text-xl font-semibold">Practice & Membership Status</h2>
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
                className="mx-cta-primary mt-3 inline-block px-3 py-2 text-sm"
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
                className="mx-cta-secondary mt-3 inline-block px-3 py-2 text-sm"
              >
                {operations.membershipCtaLabel}
              </Link>
            </div>
          </div>
          {nextSession ? (
            <div className="mt-4 rounded-2xl border border-zinc-700/80 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Next Session</p>
              <p className="mt-2 text-sm text-zinc-100">
                {nextSession.label}: {formatDateMMDDYYYY(nextSession.date)} {formatTimeRangeEST(nextSession.startTime, nextSession.endTime)}
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
                  {session.label}: {formatDateMMDDYYYY(session.date)} {formatTimeRangeEST(session.startTime, session.endTime)}
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
              allowFullScreen
              loading="lazy"
            />
          </div>
        </article>
        <article className="rounded-3xl border border-white/10 bg-zinc-900/75 p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
          <h2 className="text-xl font-semibold">{home.videoTitle}</h2>
          <p className="mt-2 text-sm text-zinc-200/85">{home.videoDescription}</p>
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/70 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-black/60 to-transparent" />
            <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-full border border-white/20 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-200">
              Featured Footage
            </div>
            <div className="relative aspect-video w-full">
              <video
                controls
                preload="metadata"
                playsInline
                poster="/media/gallery/hero.webp"
                className="h-full w-full object-cover"
                src={home.trackVideoUrl}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
            <p>Track highlight reel from Martin MX Park.</p>
            <a href={home.trackVideoUrl} className="text-green-300 underline">
              Open Video Source
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
