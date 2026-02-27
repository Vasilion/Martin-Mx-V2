import Image from "next/image";
import { getGalleryItems } from "@/lib/content/loader";

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <section className="space-y-4 text-white">
      <h1 className="text-3xl font-bold">Gallery</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded border border-zinc-700 bg-zinc-900">
            <div className="relative h-52 w-full bg-zinc-800">
              <Image src={item.image} alt={item.alt} fill sizes="(max-width: 768px) 100vw, 50vw" />
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
