import Link from "next/link";
import { getTrackInfoContent } from "@/lib/content/loader";

export default async function TrackInfoPage() {
  const trackInfo = await getTrackInfoContent();

  return (
    <section className="space-y-4 text-white">
      <h1 className="text-3xl font-bold">Track Info</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded border border-zinc-700 bg-zinc-900 p-4">
          <h2 className="text-xl font-semibold">Hours</h2>
          <p className="mt-2 text-sm text-zinc-300">{trackInfo.hoursText}</p>
        </article>
        <article className="rounded border border-zinc-700 bg-zinc-900 p-4">
          <h2 className="text-xl font-semibold">Pricing</h2>
          <p className="mt-2 text-sm text-zinc-300">{trackInfo.pricingText}</p>
        </article>
      </div>

      <article className="rounded border border-zinc-700 bg-zinc-900 p-4">
        <h2 className="text-xl font-semibold">Track Requirements</h2>
        <ul className="mt-2 list-disc space-y-2 pl-6 text-zinc-300">
          {trackInfo.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="rounded border border-zinc-700 bg-zinc-900 p-4">
        <h2 className="text-xl font-semibold">Waivers</h2>
        <div className="mt-2 flex flex-wrap gap-3">
          {trackInfo.waiverLinks.map((link) => (
            <Link key={link.label} href={link.href} className="rounded bg-red-700 px-4 py-2 text-sm font-medium">
              {link.label}
            </Link>
          ))}
        </div>
      </article>

      <article className="rounded border border-zinc-700 bg-zinc-900 p-4">
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
