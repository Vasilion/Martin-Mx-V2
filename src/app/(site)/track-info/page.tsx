import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { TriangleAlert, ArrowDownToLine, Check, CupSoda, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Reveal, RevealLi } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getContent } from "@/lib/park/content";
import { getPractice } from "@/lib/park/live";
import { formatPrice, formatTimeRange } from "@/lib/park/format";

export const metadata: Metadata = pageMetadata({
  title: "Track Info",
  description:
    "Hours, pricing, required gear, minor rider policy, waivers and track rules for Martin MX Park.",
  path: "/track-info",
  og: "track-info",
});

// Owner edits in the dashboard must show immediately; data is a couple of DynamoDB reads.
export const dynamic = "force-dynamic";

const sections = [
  { id: "hours", label: "Hours & pricing" },
  { id: "gear", label: "Gear" },
  { id: "minors", label: "Minors" },
  { id: "waivers", label: "Waivers" },
  { id: "rules", label: "Rules" },
  { id: "events", label: "Special events" },
];

function SectionTitle({ eyebrow, title, accent }: { eyebrow: string; title: string; accent?: string }) {
  return (
    <Reveal>
      <p className="eyebrow text-volt">{eyebrow}</p>
      <h2 className="display mt-3 text-[clamp(2.75rem,6vw,5.5rem)] text-white">
        {title} {accent && <span className="text-outline">{accent}</span>}
      </h2>
    </Reveal>
  );
}

export default async function TrackInfoPage() {
  const [practice, info, { items: waivers }] = await Promise.all([getPractice(), getContent("trackInfo"), getContent("waivers")]);

  return (
    <>
      <PageHeader
        eyebrow="Track info"
        title="Know before"
        accent="you go."
        image="/photos/roost-green.jpg"
        imagePosition="center 35%"
        intro={info.intro}
      >
        <Button asChild variant="race" size="xl">
          <Link href="#waivers">
            <ArrowDownToLine aria-hidden /> Get the waivers
          </Link>
        </Button>
      </PageHeader>

      {/* Sticky jump nav */}
      <nav aria-label="On this page" className="sticky top-16 z-30 border-y border-white/10 bg-ink/90 backdrop-blur-md md:top-20">
        <ul className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-4 py-2 [mask-image:linear-gradient(to_right,black_85%,transparent)] [scrollbar-width:none] md:px-8 md:[mask-image:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => (
            <li key={s.id} className="shrink-0">
              <a href={`#${s.id}`} className="eyebrow block rounded-sm px-3 py-2 text-white/65 transition hover:bg-white/5 hover:text-white">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="bg-ink">
        {/* Hours & pricing */}
        <section id="hours" className="mx-auto max-w-[1440px] scroll-mt-36 px-4 py-20 md:px-8 md:py-28">
          <SectionTitle eyebrow="Hours & pricing" title="When we ride." />
          <div className="mt-12 grid gap-px overflow-hidden rounded-sm bg-white/10 lg:grid-cols-2">
            <div className="bg-ink-2 p-7 md:p-10">
              <p className="eyebrow text-white/50">Regular hours · bikes only</p>
              <ul className="mt-6 divide-y divide-white/10">
                {practice.hours.map((h) => (
                  <li key={h.day} className="flex flex-col gap-1 py-4 min-[400px]:flex-row min-[400px]:items-baseline min-[400px]:justify-between min-[400px]:gap-4">
                    <span className="font-display text-[clamp(1.5rem,8vw,1.875rem)] font-bold uppercase italic text-white">{h.day}</span>
                    <span className="whitespace-nowrap text-lg text-white/75">{formatTimeRange(h.open, h.close)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-white/55">
                {practice.hoursNote}{" "}
                <Link href="/schedule" className="text-volt underline-offset-4 hover:underline">
                  See the schedule →
                </Link>
              </p>
            </div>
            <div className="grid gap-px bg-white/10 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: "Main track", value: formatPrice(practice.prices.main), sub: "per class" },
                { label: "Junior track", value: formatPrice(practice.prices.junior), sub: "per rider" },
                { label: "Spectators", value: formatPrice(practice.prices.spectator), sub: "ages 5 & under free" },
              ].map((p) => (
                <div key={p.label} className="flex items-center justify-between gap-4 bg-ink-2 p-7 sm:flex-col sm:items-start lg:flex-row lg:items-center">
                  <div>
                    <p className="eyebrow text-white/50">{p.label}</p>
                    <p className="mt-1 text-sm text-white/55">{p.sub}</p>
                  </div>
                  <p className="display text-6xl text-volt">{p.value}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-6 flex items-start gap-3 text-white/65">
            <CupSoda className="mt-0.5 size-5 shrink-0 text-volt" aria-hidden />
            {info.concessions}
          </p>
        </section>

        {/* Gear */}
        <section id="gear" className="scroll-mt-36 border-t border-white/10">
          <div className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <SectionTitle eyebrow="Required gear" title="No gear." accent="No ride." />
                <Reveal delay={0.08}>
                  <p className="mt-6 max-w-md text-white/70">{info.gearNote}</p>
                </Reveal>
              </div>
              <ul className="grid gap-px self-start overflow-hidden rounded-sm bg-white/10 sm:grid-cols-2 lg:col-span-7">
                {info.gear.map((item, i) => (
                  <RevealLi key={i} delay={i * 0.04} className="flex h-full items-center gap-4 bg-ink-2 p-6">
                      <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-volt text-ink">
                        <Check className="size-5" strokeWidth={3} aria-hidden />
                      </span>
                      <span className="font-display text-xl font-bold uppercase italic text-white">{item}</span>
                  </RevealLi>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Minors */}
        <section id="minors" className="clip-slant-t scroll-mt-36 bg-bone pt-[4vw] text-ink">
          <div className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
            <div className="grid gap-12 lg:grid-cols-12">
              <Reveal className="lg:col-span-5">
                <p className="eyebrow text-brand">Riders under 18</p>
                <h2 className="display mt-3 text-[clamp(2.75rem,6vw,5.5rem)]">Minor riders.</h2>
                <p className="mt-6 max-w-md text-lg text-ink/75">{info.minorIntro}</p>
              </Reveal>
              <div className="lg:col-span-7">
                <ol className="divide-y divide-ink/10 border-y border-ink/10">
                  {info.minorRules.map((rule, i) => (
                    <li key={i} className="flex gap-6 py-6">
                      <span className="display w-10 shrink-0 text-4xl text-brand">{i + 1}</span>
                      <p className="text-lg text-ink/85">{rule}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-8 flex gap-4 rounded-sm border-2 border-ink bg-caution/90 p-6">
                  <TriangleAlert className="mt-1 size-6 shrink-0" aria-hidden />
                  <div>
                    <p className="font-display text-2xl font-bold uppercase italic">{info.noParentTitle}</p>
                    <p className="mt-2 text-ink/85">{info.noParentBody}</p>
                    <a href="#waivers" className="eyebrow mt-4 inline-block underline underline-offset-4">
                      Get the guardian release
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Waivers */}
        <section id="waivers" className="scroll-mt-36">
          <div className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
            <SectionTitle eyebrow="Print before you leave" title="Waivers." />
            <Reveal delay={0.06}>
              <p className="mt-6 max-w-2xl text-white/70">
                Everyone signs at check-in, spectators included. Printing and filling yours out at home gets you
                through the gate faster.
              </p>
            </Reveal>
            <ul className="mt-12 grid gap-4 md:grid-cols-3">
              {waivers.map((w, i) => (
                <RevealLi key={w.id} delay={i * 0.06}>
                    <a
                      href={w.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex h-full flex-col justify-between gap-10 rounded-sm border border-white/12 bg-ink-2 p-5 transition hover:border-volt hover:bg-ink-3 sm:p-7"
                    >
                      <div>
                        <p className={w.id === "guardian" ? "eyebrow text-caution" : "eyebrow text-white/50"}>{w.note}</p>
                        <p className="display mt-3 text-[clamp(2.25rem,11vw,3rem)] text-white">{w.label}</p>
                      </div>
                      <span className="eyebrow flex items-center gap-2 text-volt">
                        <ArrowDownToLine className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden />
                        Download PDF
                      </span>
                    </a>
                </RevealLi>
              ))}
            </ul>
          </div>
        </section>

        {/* Rules */}
        <section id="rules" className="scroll-mt-36 border-t border-white/10">
          <div className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
            <SectionTitle eyebrow="Track rules & policies" title="House rules." />
            <ul className="mt-12 grid gap-px overflow-hidden rounded-sm bg-white/10 md:grid-cols-2 xl:grid-cols-3">
              {info.rules.map((rule, i) => (
                <li key={i} className="bg-ink-2 p-7">
                  <p className="eyebrow text-white/35">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-2 font-display text-2xl font-bold uppercase italic text-white">{rule.title}</h3>
                  <p className="mt-2 text-white/65">{rule.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Special events */}
        <section id="events" className="scroll-mt-36 border-t border-white/10">
          <div className="mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
            <SectionTitle eyebrow="Race days & specials" title="Special events." />
            <ul className="mt-12 grid gap-4 md:grid-cols-3">
              {info.specialEvents.map((p, i) => (
                <li key={i} className="flex gap-4 rounded-sm border border-white/12 p-7">
                  <ShieldCheck className="mt-1 size-5 shrink-0 text-volt" aria-hidden />
                  <div>
                    <h3 className="font-display text-2xl font-bold uppercase italic text-white">{p.title}</h3>
                    <p className="mt-2 text-white/65">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
