"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type GalleryItem = {
  id: string;
  title: string;
  image: string;
  alt: string;
  isFeatured?: boolean;
};

type InteractiveGalleryProps = {
  items: GalleryItem[];
};

export function InteractiveGallery({ items }: InteractiveGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (activeIndex === null) {
        return;
      }
      if (event.key === "Escape") {
        setActiveIndex(null);
        return;
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((activeIndex + 1) % items.length);
        return;
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((activeIndex - 1 + items.length) % items.length);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, items.length]);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-green-500/60"
            onClick={() => setActiveIndex(index)}
          >
            <div className="relative aspect-[4/3] w-full bg-zinc-800">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
            </div>
            <div className="p-4">
              <h2 className="font-semibold">{item.title}</h2>
              {item.isFeatured ? <p className="mt-1 text-xs text-green-300">Featured</p> : null}
              <p className="mt-1 text-xs text-zinc-400">Click to expand</p>
            </div>
          </article>
        ))}
      </div>

      {activeIndex !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            aria-label="Close lightbox"
            className="absolute right-4 top-4 rounded-xl border border-zinc-500 bg-zinc-950/90 px-3 py-2 text-sm text-white"
            onClick={() => setActiveIndex(null)}
          >
            Close
          </button>
          <button
            type="button"
            aria-label="Previous image"
            className="absolute left-4 rounded-xl border border-zinc-500 bg-zinc-950/90 px-3 py-2 text-sm text-white"
            onClick={() => setActiveIndex((activeIndex - 1 + items.length) % items.length)}
          >
            Prev
          </button>
          <div className="w-full max-w-5xl">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-900">
              <Image
                src={items[activeIndex].image}
                alt={items[activeIndex].alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-zinc-200">{items[activeIndex].title}</p>
              <p className="rounded-full border border-zinc-600 px-3 py-1 text-xs text-zinc-300">
                {activeIndex + 1} / {items.length}
              </p>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border ${
                    index === activeIndex ? "border-green-500" : "border-zinc-700"
                  }`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Open image ${index + 1}`}
                >
                  <Image src={item.image} alt={item.alt} fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            aria-label="Next image"
            className="absolute right-4 rounded-xl border border-zinc-500 bg-zinc-950/90 px-3 py-2 text-sm text-white"
            onClick={() => setActiveIndex((activeIndex + 1) % items.length)}
          >
            Next
          </button>
        </div>
      ) : null}
    </>
  );
}
