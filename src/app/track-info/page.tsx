import Image from "next/image";
import Link from "next/link";
import { getTrackInfoContent, getTracksContent } from "@/lib/content/loader";
import { InteractiveGallery } from "@/components/interactive-gallery";

export default async function TrackInfoPage() {
  const [trackInfo, tracks] = await Promise.all([getTrackInfoContent(), getTracksContent()]);
  const trackGalleryItems = [
    {
      id: "track-main-1",
      title: "Main Track Action",
      image: "/media/gallery/strapi-main-1.jpg",
      alt: "Main track rider cornering",
    },
    {
      id: "track-main-2",
      title: "Main Track Session",
      image: "/media/gallery/strapi-main-2.jpg",
      alt: "Main track during practice",
    },
    {
      id: "track-jr-1",
      title: "Junior Track Rider",
      image: "/media/gallery/strapi-youth-1.jpg",
      alt: "Junior track rider progression",
    },
    {
      id: "track-jr-2",
      title: "Junior Track Turn",
      image: "/media/gallery/strapi-youth-2.jpg",
      alt: "Junior track turn section",
    },
  ];

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
        <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-xl bg-zinc-800">
          <Image
            src="/media/gallery/track-photo.jpg"
            alt="Main track photo at Martin MX Park"
            fill
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-cover"
          />
        </div>
      </article>

      <article className="rounded-2xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <h2 className="text-xl font-semibold">{tracks.juniorTrackTitle}</h2>
        {tracks.juniorTrackDescription.map((paragraph) => (
          <p key={paragraph} className="mt-2 text-sm text-zinc-300">
            {paragraph}
          </p>
        ))}
        <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-xl bg-zinc-800">
          <Image
            src="/media/gallery/blog-2.jpg"
            alt="Junior track photo at Martin MX Park"
            fill
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-cover"
          />
        </div>
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

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Track Photo Viewer</h2>
        <p className="text-sm text-zinc-300">Open any image to view full size and use keyboard arrows to navigate.</p>
        <InteractiveGallery items={trackGalleryItems} />
      </section>
    </section>
  );
}
