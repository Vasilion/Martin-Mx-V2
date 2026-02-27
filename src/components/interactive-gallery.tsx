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
            className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur"
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
            className="absolute right-4 top-4 rounded-xl border border-zinc-500 px-3 py-2 text-sm text-white"
            onClick={() => setActiveIndex(null)}
          >
            Close
          </button>
          <button
            type="button"
            className="absolute left-4 rounded-xl border border-zinc-500 px-3 py-2 text-sm text-white"
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
            <p className="mt-3 text-center text-sm text-zinc-200">{items[activeIndex].title}</p>
          </div>
          <button
            type="button"
            className="absolute right-4 rounded-xl border border-zinc-500 px-3 py-2 text-sm text-white"
            onClick={() => setActiveIndex((activeIndex + 1) % items.length)}
          >
            Next
          </button>
        </div>
      ) : null}
    </>
  );
}
