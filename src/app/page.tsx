import Link from "next/link";
import Script from "next/script";
import { WeatherCard } from "@/components/weather-card";
import {
  getAnnouncements,
  getHomeContent,
  getOperationsContent,
  getSiteSettings,
} from "@/lib/content/loader";

export default async function Home() {
  const [home, settings, operations, rawAnnouncements] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
    getOperationsContent(),
    getAnnouncements(),
  ]);
  const announcements = rawAnnouncements.filter((item) => item.active);
  return (
    <section className="space-y-8">
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
      <div className="rounded-xl bg-zinc-950 p-8 text-white">
        <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">{settings.siteName}</p>
        <h1 className="mt-2 text-4xl font-bold">{home.heroTitle}</h1>
        <p className="mt-3 max-w-2xl text-zinc-300">{home.heroDescription}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={home.heroCtaHref} className="rounded bg-red-700 px-4 py-2 font-medium">
            {home.heroCtaLabel}
          </Link>
          <Link href="/register" className="rounded border border-zinc-600 px-4 py-2">
            Register Now
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {home.features.map((feature) => (
          <article key={feature.title} className="rounded border border-zinc-800 bg-zinc-900 p-4 text-white">
            <h2 className="text-lg font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm text-zinc-300">{feature.description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border border-zinc-800 bg-zinc-900 p-4 text-white">
          <p className="text-sm text-zinc-300">Practice Status: {settings.practiceOpen ? "Open" : "Closed"}</p>
          <p className="text-sm text-zinc-400">Practice Label: {operations.practiceStatusLabel}</p>
          <p className="text-sm text-zinc-300">
            Membership Status: {settings.membershipOpen ? "Open" : "Closed"}
          </p>
          <p className="text-sm text-zinc-400">Membership Label: {operations.membershipStatusLabel}</p>
          {settings.practiceCancelled ? (
            <p className="mt-2 text-sm text-red-300">Cancellation: {settings.practiceCancelReason}</p>
          ) : null}
          {operations.practiceCashOnly ? (
            <p className="mt-2 text-sm text-amber-300">Practice sessions are currently cash only.</p>
          ) : null}
          {operations.practiceSessions.length > 0 ? (
            <div className="mt-3 space-y-1 text-xs text-zinc-400">
              {operations.practiceSessions.map((session) => (
                <p key={session.label}>
                  {session.label}: {session.date} {session.startTime}-{session.endTime}
                </p>
              ))}
            </div>
          ) : null}
          <p className="mt-3 text-sm text-zinc-400">{settings.tagline}</p>
          <a className="mt-3 inline-block text-sm text-red-300 underline" href={settings.storeLink}>
            Visit Merch Store
          </a>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/schedule" className="rounded bg-zinc-800 px-3 py-2 text-sm">
              View Schedule
            </Link>
            <Link href="/contact" className="rounded bg-zinc-800 px-3 py-2 text-sm">
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
              className={`rounded border p-4 text-sm ${
                announcement.severity === "warning"
                  ? "border-amber-700 bg-amber-900/20 text-amber-100"
                  : announcement.severity === "success"
                    ? "border-emerald-700 bg-emerald-900/20 text-emerald-100"
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
        <article className="rounded border border-zinc-800 bg-zinc-900 p-4 text-white">
          <h2 className="text-xl font-semibold">{home.trackMapTitle}</h2>
          <p className="mt-2 text-sm text-zinc-300">{home.trackMapDescription}</p>
          <div className="mt-4 aspect-video overflow-hidden rounded border border-zinc-700">
            <iframe
              title={home.trackMapTitle}
              src={home.trackMapEmbedUrl}
              className="h-full w-full"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              loading="lazy"
            />
          </div>
        </article>
        <article className="rounded border border-zinc-800 bg-zinc-900 p-4 text-white">
          <h2 className="text-xl font-semibold">{home.videoTitle}</h2>
          <p className="mt-2 text-sm text-zinc-300">{home.videoDescription}</p>
          <div className="mt-4 overflow-hidden rounded border border-zinc-700">
            <video controls preload="none" className="w-full" src={home.trackVideoUrl} />
          </div>
        </article>
      </div>
    </section>
  );
}
