import Image from "next/image";
import { getGalleryItems } from "@/lib/content/loader";

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <section className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <h1 className="text-3xl font-bold md:text-4xl">Gallery</h1>
        <p className="mt-2 text-sm text-zinc-300 md:text-base">
          Recent visuals from Martin MX sessions and rider activity.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur"
          >
            <div className="relative aspect-[4/3] w-full bg-zinc-800">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h2 className="font-semibold">{item.title}</h2>
              {item.isFeatured ? <p className="mt-1 text-xs text-green-300">Featured</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
