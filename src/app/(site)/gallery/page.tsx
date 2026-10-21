import Image from "next/image";
import Link from "next/link";
import { getGalleryItems } from "@/lib/content/loader";
import { InteractiveGallery } from "@/components/interactive-gallery";

export default async function GalleryPage() {
  const items = await getGalleryItems();
  const spotlight = items.slice(0, 3);

  return (
    <section className="space-y-8 text-white md:space-y-10">
      <header className="relative overflow-hidden border-y border-white/10 bg-black/15 p-6">
        <div className="mx-grid-overlay pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(51,142,0,0.2),transparent_45%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Visual Stories</p>
          <h1 className="mx-display mt-2 text-3xl font-bold md:text-5xl">Gallery</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-300 md:text-base">
            Recent visuals from Martin MX sessions and rider activity.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/track-info"
              className="mx-cta-secondary px-4 py-2 text-sm"
            >
              Explore Track Info
            </Link>
            <Link
              href="/register"
              className="mx-cta-primary px-4 py-2 text-sm"
            >
              Ride With Us
            </Link>
          </div>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {spotlight.map((item) => (
          <article
            key={item.id}
            className="mx-card-interactive overflow-hidden rounded-2xl border border-white/10 bg-transparent shadow-[0_14px_40px_rgba(0,0,0,0.3)]"
          >
            <div className="relative aspect-[4/3] w-full bg-zinc-800">
              <Image src={item.image} alt={item.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4">
                <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
      <InteractiveGallery items={items} />
    </section>
  );
}
