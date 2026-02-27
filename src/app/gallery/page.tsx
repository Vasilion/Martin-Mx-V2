import Link from "next/link";
import { getGalleryItems } from "@/lib/content/loader";
import { InteractiveGallery } from "@/components/interactive-gallery";

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <section className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <h1 className="text-3xl font-bold md:text-4xl">Gallery</h1>
        <p className="mt-2 text-sm text-zinc-300 md:text-base">
          Recent visuals from Martin MX sessions and rider activity.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/track-info" className="rounded-xl border border-zinc-500 px-4 py-2 text-sm font-semibold text-zinc-200">
            Explore Track Info
          </Link>
          <Link href="/register" className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white">
            Ride With Us
          </Link>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Visual Coverage", value: "Main + Junior" },
          { label: "Image Quality", value: "High Resolution" },
          { label: "Viewer Mode", value: "Interactive Lightbox" },
          { label: "Content Source", value: "CMS Managed" },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-white/10 bg-zinc-900/75 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.3)]"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{item.label}</p>
            <p className="mt-2 text-sm font-semibold text-zinc-100">{item.value}</p>
          </article>
        ))}
      </section>
      <InteractiveGallery items={items} />
    </section>
  );
}
