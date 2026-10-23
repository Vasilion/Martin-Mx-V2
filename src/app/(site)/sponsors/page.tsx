import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, RevealLi } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getSponsors, type Sponsor } from "@/lib/park/live";
import { getSite } from "@/lib/park/content";

export const metadata: Metadata = pageMetadata({
  title: "Sponsors",
  description:
    "The local businesses that keep Martin MX Park running, and how to put your brand trackside.",
  path: "/sponsors",
  og: "sponsors",
});

// Owner edits in the dashboard must show immediately; data is a couple of DynamoDB reads.
export const dynamic = "force-dynamic";

function hostOf(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

/**
 * Logos arrive in every format (transparent PNGs with dark ink, white-on-transparent,
 * flat JPGs on white), so every one sits on the same white plate at the same optical size.
 */
function SponsorTile({ sponsor, featured }: { sponsor: Sponsor; featured?: boolean }) {
  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-sm bg-white shadow-[0_1px_0_rgb(0_0_0/0.06)] ring-1 ring-ink/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/15 hover:ring-brand"
    >
      <div className={cn("grid flex-1 place-items-center px-8", featured ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[4/3]")}>
        {/* eslint-disable-next-line @next/next/no-img-element -- mixed-format sponsor logos at intrinsic aspect */}
        <img
          src={sponsor.logo}
          alt={sponsor.name}
          loading="lazy"
          className={cn(
            "object-contain transition duration-300 group-hover:scale-[1.04]",
            featured ? "max-h-[55%] max-w-[70%]" : "max-h-[62%] max-w-[78%]",
          )}
        />
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-ink/10 px-5 py-4">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold uppercase italic leading-tight text-ink">{sponsor.name}</p>
          <p className="truncate text-sm text-ink/55">{hostOf(sponsor.href)}</p>
        </div>
        <ArrowUpRight className="size-5 shrink-0 text-ink/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden />
      </div>
    </a>
  );
}

export default async function SponsorsPage() {
  const [sponsors, site] = await Promise.all([getSponsors(), getSite()]);
  const title = sponsors.filter((s) => s.title);
  const rest = sponsors.filter((s) => !s.title);
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent("Sponsoring Martin MX Park")}`;

  return (
    <>
      <PageHeader
        eyebrow="Sponsors"
        title="Backed by"
        accent="the best."
        image="/photos/roost-495.jpg"
        imagePosition="center 35%"
        intro="Martin MX runs on local businesses who show up for riders every season. Give them your business. They give it right back to the track."
      />

      <section className="clip-slant-t -mt-[4vw] bg-bone pb-24 pt-[calc(4vw+4rem)] text-ink md:pb-32 md:pt-[calc(4vw+6rem)]">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          {title.length > 0 && (
            <div className="mb-16 md:mb-20">
              <Reveal>
                <p className="eyebrow text-brand">Title sponsor{title.length > 1 ? "s" : ""}</p>
              </Reveal>
              <ul className={cn("mt-6 grid gap-5", title.length > 1 && "md:grid-cols-2")}>
                {title.map((s) => (
                  <RevealLi key={s.id}>
                    <SponsorTile sponsor={s} featured />
                  </RevealLi>
                ))}
              </ul>
            </div>
          )}

          <Reveal className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-brand">Track partners</p>
              <h2 className="display mt-3 text-[clamp(2.5rem,5vw,4.5rem)]">Thank you.</h2>
            </div>
            <p className="eyebrow hidden pb-2 text-ink/45 sm:block">{sponsors.length} partners</p>
          </Reveal>

          {sponsors.length > 0 ? (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(title.length > 0 ? rest : sponsors).map((s, i) => (
                <RevealLi key={s.id} delay={i * 0.05}>
                  <SponsorTile sponsor={s} />
                </RevealLi>
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-lg text-ink/70">Sponsor spots are open for this season. Yours could be first.</p>
          )}
        </div>
      </section>

      {/* Sponsorship pitch */}
      <section className="grain relative isolate overflow-hidden bg-ink">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_50%,color-mix(in_oklab,var(--brand)_45%,transparent),transparent_60%)]" />
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-24 md:px-8 md:py-32 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow text-volt">Become a sponsor</p>
            <h2 className="display mt-4 text-[clamp(1.75rem,calc((100vw-2rem)/5.6),3rem)] sm:text-[clamp(3rem,7vw,6.5rem)] text-white">
              Put your brand <span className="text-volt">trackside.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              Riders and families are at Martin MX every ride day of the season. Get your name in front of them on
              site, here on the website, and across our socials.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col justify-end gap-3 lg:col-span-4 lg:col-start-9">
            <Button asChild variant="race" size="2xl" className="w-full">
              <a href={mailto}>
                <Mail aria-hidden /> Email about sponsoring
              </a>
            </Button>
            <Button asChild variant="race-outline" size="2xl" className="w-full">
              <a href={site.phoneHref}>
                <Phone aria-hidden /> Call {site.phone}
              </a>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
