"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { isRemote } from "@/lib/media";

type Photo = { id: string; src: string; alt: string; width: number; height: number };

/** Masonry-style columns + full-screen lightbox with keyboard and swipe. */
export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [touchX, setTouchX] = useState<number | null>(null);

  const go = useCallback((dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <ul className="columns-2 gap-3 md:columns-3 md:gap-4 xl:columns-4">
        {photos.map((p, i) => (
          <li key={p.id} className="mb-3 break-inside-avoid md:mb-4">
            <button type="button" onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden rounded-sm" aria-label={p.alt ? `Open photo: ${p.alt}` : "Open photo"}>
              <Image
                src={p.src}
                alt={p.alt}
                width={p.width}
                height={p.height}
                unoptimized={isRemote(p.src)}
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="h-auto w-full transition duration-500 group-hover:scale-[1.03] group-hover:brightness-110"
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent
          showCloseButton={false}
          className="h-[100dvh] max-w-none border-0 bg-black/95 p-0 sm:max-w-none sm:rounded-none"
          onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            setTouchX(null);
          }}
        >
          <DialogTitle className="sr-only">{current?.alt || "Photo"}</DialogTitle>
          {current && (
            <div className="relative h-full w-full">
              <Image src={current.src} alt={current.alt} fill unoptimized={isRemote(current.src)} sizes="100vw" className="object-contain" priority />
            </div>
          )}
          <button type="button" onClick={() => setOpen(null)} className="absolute right-4 top-4 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close">
            <X className="size-6" />
          </button>
          <button type="button" onClick={() => go(-1)} className="absolute left-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid" aria-label="Previous photo">
            <ChevronLeft className="size-7" />
          </button>
          <button type="button" onClick={() => go(1)} className="absolute right-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid" aria-label="Next photo">
            <ChevronRight className="size-7" />
          </button>
          {open !== null && (
            <p className="eyebrow absolute bottom-5 left-1/2 -translate-x-1/2 text-white/60">
              {open + 1} / {photos.length}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
