import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

import type { Content } from "@/lib/park/content";
import { isRemote } from "@/lib/media";

type Shot = Content<"gallery">["items"][number];

/** Horizontal, scroll-snapping photo rail. Native scroll keeps it fast and touch-friendly. */
export function GalleryStrip({ heading, shots }: { heading: string; shots: Shot[] }) {
  if (shots.length === 0) return null;
  return (
    <section className="bg-ink py-24 md:py-32">
      <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-6 px-4 md:px-8">
        <Reveal>
          <p className="eyebrow text-white/50">From the track</p>
          <h2 className="display mt-4 text-[clamp(3rem,7vw,6.5rem)] text-white">{heading}</h2>
        </Reveal>
        <Link href="/gallery" className="eyebrow group hidden shrink-0 items-center gap-2 pb-3 text-white/80 hover:text-volt sm:flex">
          Full gallery <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
      <ul className="mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-4 [scrollbar-width:none] md:scroll-px-8 md:gap-4 md:px-8 [&::-webkit-scrollbar]:hidden">
        {shots.map((shot) => (
          <li key={shot.id} className="grain relative h-[52vh] max-h-[560px] min-h-[320px] shrink-0 snap-start overflow-hidden rounded-sm" style={{ aspectRatio: `${shot.width} / ${shot.height}` }}>
            <Image src={shot.src} alt={shot.alt} unoptimized={isRemote(shot.src)} fill sizes="(min-width: 768px) 50vw, 85vw" className="object-cover transition-transform duration-700 hover:scale-105" />
          </li>
        ))}
      </ul>
      <Link href="/gallery" className="eyebrow mx-4 mt-6 flex items-center gap-2 text-white/80 sm:hidden">
        Full gallery <ArrowRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}
