"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type GalleryItem = {
  id: string;
  title: string;
  image: string;
  alt: string;
  isFeatured?: boolean;
};

type InteractiveGalleryProps = {
  items: GalleryItem[];
  columns?: 2 | 3 | 4;
  showMeta?: boolean;
};

export function InteractiveGallery({ items, columns = 2, showMeta = true }: InteractiveGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const columnClass =
    columns === 4 ? "md:grid-cols-4" : columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

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
      <div className={`grid gap-4 ${columnClass}`}>
        {items.map((item, index) => (
          <motion.article
            key={item.id}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-green-500/60"
            onClick={() => setActiveIndex(index)}
            whileHover={prefersReducedMotion ? undefined : { y: -3 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
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
            {showMeta ? (
              <div className="p-4">
                <h2 className="font-semibold">{item.title}</h2>
                {item.isFeatured ? <p className="mt-1 text-xs text-green-300">Featured</p> : null}
                <p className="mt-1 text-xs text-zinc-400">Click to expand</p>
              </div>
            ) : null}
          </motion.article>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setActiveIndex(null);
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
          >
            <button
              type="button"
              aria-label="Close lightbox"
              className="absolute right-4 top-4 z-10 h-10 w-10 rounded-full border border-zinc-400 bg-zinc-950/90 text-xl font-semibold leading-none text-white"
              onClick={() => setActiveIndex(null)}
            >
              ×
            </button>
            <button
              type="button"
              aria-label="Previous image"
              className="absolute left-4 rounded-xl border border-zinc-500 bg-zinc-950/90 px-3 py-2 text-sm text-white"
              onClick={() => setActiveIndex((activeIndex - 1 + items.length) % items.length)}
            >
              Prev
            </button>
            <motion.div
              className="w-full max-w-5xl"
              initial={prefersReducedMotion ? undefined : { y: 12, opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { y: 0, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { y: 8, opacity: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
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
            </motion.div>
            <button
              type="button"
              aria-label="Next image"
              className="absolute right-4 rounded-xl border border-zinc-500 bg-zinc-950/90 px-3 py-2 text-sm text-white"
              onClick={() => setActiveIndex((activeIndex + 1) % items.length)}
            >
              Next
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
