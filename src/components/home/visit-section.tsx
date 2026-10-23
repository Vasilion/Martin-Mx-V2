import Link from "next/link";
import { ArrowUpRight, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import type { Sponsor } from "@/lib/park/live";
import type { Content, SiteInfo } from "@/lib/park/content";

export function VisitSection({ sponsors, site, home }: { sponsors: Sponsor[]; site: SiteInfo; home: Content<"home"> }) {
  return (
    <section className="bg-ink pb-24 md:pb-32">
      {sponsors.length > 0 && (
        <div className="border-y border-white/10">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 py-12 md:flex-row md:items-center md:px-8">
            <p className="eyebrow shrink-0 text-white/50">
              Backed by
              <Link href="/sponsors" className="ml-3 text-white/80 hover:text-volt">
                Our sponsors →
              </Link>
            </p>
            <ul className="flex flex-1 flex-wrap items-center gap-x-12 gap-y-8 md:justify-end">
              {sponsors.map((s) => (
                <li key={s.id}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="block opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" aria-label={s.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- mixed-format sponsor logos at intrinsic aspect */}
                    <img src={s.logo} alt={s.name} className="h-14 w-36 rounded-[2px] bg-white object-contain px-3 py-2 md:h-16 md:w-44" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mx-auto mt-24 grid max-w-[1440px] gap-10 px-4 md:mt-32 md:px-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow text-white/50">Find us</p>
          <h2 className="display mt-4 text-[clamp(1.75rem,calc((100vw-2rem)/5.6),2.75rem)] sm:text-[clamp(2.75rem,7vw,6.5rem)] text-white">
            {home.visitHeading} {home.visitAccent && <span className="inline-block text-volt">{home.visitAccent}</span>}
          </h2>
          <address className="mt-8 not-italic text-xl text-white/80">
            {site.street}
            <br />
            {site.city}, {site.region} {site.postalCode}
          </address>
          {home.visitNote && <p className="mt-4 text-white/60">{home.visitNote}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="race" size="xl">
              <a href={site.mapsUrl} target="_blank" rel="noreferrer">
                <Navigation aria-hidden /> Directions
              </a>
            </Button>
            <Button asChild variant="race-outline" size="xl">
              <a href={site.phoneHref}>
                Call <span className="whitespace-nowrap">{site.phone}</span>
              </a>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-white/10 md:aspect-[16/10]">
            <iframe
              title="Map to Martin MX Park"
              src={site.mapsEmbedUrl}
              className="absolute inset-0 h-full w-full grayscale invert-[0.92] hue-rotate-180"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="eyebrow absolute bottom-4 right-4 flex items-center gap-1 rounded-sm bg-ink px-3 py-2 text-white hover:text-volt"
            >
              Open in Maps <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
