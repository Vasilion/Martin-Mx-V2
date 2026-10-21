import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import { tracks, type TrackId } from "@/lib/park/facts";
import { formatPrice } from "@/lib/park/format";
import type { Practice } from "@/lib/park/live";

function TrackPanel({ id, price, flip }: { id: TrackId; price: number; flip?: boolean }) {
  const t = tracks[id];
  return (
    <article className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
      <Reveal className={cn("relative lg:col-span-7", flip && "lg:order-2 lg:col-start-6")}>
        <div className="grain relative aspect-[4/3] overflow-hidden rounded-sm">
          <Image
            src={t.image}
            alt={t.imageAlt}
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            style={{ objectPosition: t.imagePosition }}
            className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-[1.04]"
          />
        </div>
        <span
          aria-hidden
          className={cn(
            "display text-outline pointer-events-none absolute -top-10 text-[9rem] text-white/25 md:-top-16 md:text-[13rem]",
            flip ? "-right-2 md:-right-6" : "-left-2 md:-left-6",
          )}
        >
          {t.number}
        </span>
      </Reveal>

      <Reveal delay={0.1} className={cn("lg:col-span-5", flip && "lg:order-1 lg:col-span-5 lg:col-start-1")}>
        <p className="eyebrow text-volt">Track {t.number}</p>
        <h3 className="display mt-3 text-6xl text-white md:text-7xl">{t.name}</h3>
        <p className="mt-4 text-xl font-medium text-white/85">{t.tagline}</p>
        <dl className="mt-8 grid grid-cols-3 border-y border-white/10">
          {t.stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse border-r border-white/10 py-5 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4">
              <dt className="eyebrow mt-1 text-[0.65rem] text-white/50">{s.label}</dt>
              <dd className="display text-4xl text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 space-y-4 text-white/70">
          {t.body.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <p className="mt-6 flex items-baseline gap-2">
          <span className="display text-4xl text-volt">{formatPrice(price)}</span>
          <span className="eyebrow text-white/50">{id === "main" ? "per class" : "per rider"}</span>
        </p>
      </Reveal>
    </article>
  );
}

export function TracksSection({ practice }: { practice: Practice }) {
  return (
    <section id="tracks" className="relative scroll-mt-20 bg-ink py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <Reveal className="max-w-3xl">
          <p className="eyebrow text-white/50">The tracks</p>
          <h2 className="display mt-4 text-[clamp(3rem,8vw,7.5rem)] text-white">
            Two tracks. <span className="text-outline text-white">Every rider.</span>
          </h2>
        </Reveal>
        <div className="mt-20 space-y-28 md:mt-28 md:space-y-40">
          <TrackPanel id="main" price={practice.prices.main} />
          <TrackPanel id="junior" price={practice.prices.junior} flip />
        </div>
      </div>
    </section>
  );
}
