import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";
import type { Content } from "@/lib/park/content";
import { isRemote } from "@/lib/media";

type TrackId = "main" | "junior";
const numbers: Record<TrackId, string> = { main: "01", junior: "02" };
import { formatPrice } from "@/lib/park/format";
import type { Practice } from "@/lib/park/live";

function TrackPanel({ id, track: t, price, flip }: { id: TrackId; track: Content<"tracks">["main"]; price: number; flip?: boolean }) {
  const number = numbers[id];
  return (
    <article className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
      <Reveal className={cn("relative lg:col-span-7", flip && "lg:order-2 lg:col-start-6")}>
        <div className="grain relative aspect-[4/3] overflow-hidden rounded-sm">
          <Image
            src={t.image}
            alt={t.imageAlt}
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            unoptimized={isRemote(t.image)}
            className="object-cover object-[center_70%] transition-transform duration-[1.2s] ease-out hover:scale-[1.04]"
          />
        </div>
        <span
          aria-hidden
          className={cn(
            "display text-outline pointer-events-none absolute -top-10 text-[9rem] text-white/25 md:-top-16 md:text-[13rem]",
            flip ? "-right-2 md:-right-6" : "-left-2 md:-left-6",
          )}
        >
          {number}
        </span>
      </Reveal>

      <Reveal delay={0.1} className={cn("lg:col-span-5", flip && "lg:order-1 lg:col-span-5 lg:col-start-1")}>
        <p className="eyebrow text-volt">Track {number}</p>
        <h3 className="display mt-3 text-[clamp(2.75rem,14vw,3.75rem)] text-white md:text-7xl">{t.name}</h3>
        <p className="mt-4 text-xl font-medium text-white/85">{t.tagline}</p>
        <dl className="mt-8 grid border-y border-white/10 min-[360px]:grid-cols-3">
          {t.stats.map((s) => (
            <div key={s.label} className="flex items-baseline justify-between gap-3 border-b border-white/10 py-3 last:border-b-0 min-[360px]:flex-col-reverse min-[360px]:items-stretch min-[360px]:justify-start min-[360px]:gap-0 min-[360px]:border-r min-[360px]:border-b-0 min-[360px]:py-5 min-[360px]:pr-2 min-[360px]:last:border-r-0 sm:pr-3 min-[360px]:[&:not(:first-child)]:pl-3 sm:[&:not(:first-child)]:pl-4">
              <dt className="eyebrow text-[0.6rem] min-[360px]:mt-1 tracking-[0.1em] text-white/50 sm:text-[0.65rem] sm:tracking-[0.2em]">{s.label}</dt>
              <dd className="display text-[clamp(1.625rem,8vw,2.25rem)] text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 space-y-4 text-white/70">
          {t.body.map((p, i) => (
            <p key={i}>{p}</p>
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

export function TracksSection({ practice, tracks, home }: { practice: Practice; tracks: Content<"tracks">; home: Content<"home"> }) {
  return (
    <section id="tracks" className="relative scroll-mt-20 bg-ink py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <Reveal className="max-w-3xl">
          <p className="eyebrow text-white/50">The tracks</p>
          <h2 className="display mt-4 text-[clamp(1.75rem,calc((100vw-2rem)/5.6),3rem)] sm:text-[clamp(3rem,8vw,7.5rem)] text-white">
            {home.tracksHeading} {home.tracksAccent && <span className="text-outline text-white">{home.tracksAccent}</span>}
          </h2>
        </Reveal>
        <div className="mt-20 space-y-28 md:mt-28 md:space-y-40">
          <TrackPanel id="main" track={tracks.main} price={practice.prices.main} />
          <TrackPanel id="junior" track={tracks.junior} price={practice.prices.junior} flip />
        </div>
      </div>
    </section>
  );
}
