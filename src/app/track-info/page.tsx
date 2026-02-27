import Link from "next/link";
import { getTrackInfoContent, getTracksContent } from "@/lib/content/loader";

export default async function TrackInfoPage() {
  const [trackInfo, tracks] = await Promise.all([getTrackInfoContent(), getTracksContent()]);

  return (
    <section className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <h1 className="text-3xl font-bold md:text-4xl">Track Info</h1>
        <p className="mt-2 text-sm text-zinc-300 md:text-base">
          Everything riders need before arrival: hours, pricing, requirements, waivers, and park rules.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
          <h2 className="text-xl font-semibold">Hours</h2>
          <p className="mt-2 text-sm text-zinc-300">{trackInfo.hoursText}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
          <h2 className="text-xl font-semibold">Pricing</h2>
          <p className="mt-2 text-sm text-zinc-300">{trackInfo.pricingText}</p>
        </article>
      </div>

      <article className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <h2 className="text-xl font-semibold">{tracks.mainTrackTitle}</h2>
        {tracks.mainTrackDescription.map((paragraph) => (
          <p key={paragraph} className="mt-2 text-sm text-zinc-300">
            {paragraph}
          </p>
        ))}
      </article>

      <article className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <h2 className="text-xl font-semibold">{tracks.juniorTrackTitle}</h2>
        {tracks.juniorTrackDescription.map((paragraph) => (
          <p key={paragraph} className="mt-2 text-sm text-zinc-300">
            {paragraph}
          </p>
        ))}
      </article>

      <article className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <h2 className="text-xl font-semibold">Track Requirements</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-zinc-300">
          {trackInfo.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <h2 className="text-xl font-semibold">Waivers</h2>
        <div className="mt-2 flex flex-wrap gap-3">
          {trackInfo.waiverLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-xl bg-gradient-to-r from-green-700 to-green-600 px-4 py-2 text-sm font-medium transition hover:from-green-600 hover:to-green-500"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <h2 className="text-xl font-semibold">Park Rules</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-zinc-300">
          {trackInfo.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
