import Link from "next/link";
import { ArrowRight, FileSignature, Flag, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, RevealLi } from "@/components/motion/reveal";
import type { Practice } from "@/lib/park/live";
import { formatPrice, formatTimeRange } from "@/lib/park/format";

const steps = [
  {
    icon: Ticket,
    title: "Register",
    body: "Pick your class and ride day online. Your spot is locked in the second you pay.",
  },
  {
    icon: FileSignature,
    title: "Sign in at the gate",
    body: "Everyone in the vehicle signs a waiver before parking. Minors need a parent on site, or a notarized guardian release.",
  },
  {
    icon: Flag,
    title: "Ride",
    body: "Gear up — DOT helmet, goggles, boots over the ankle, long sleeves and pants — and send it.",
  },
];

/** Light "bone" section: breaks up the dark page and carries the practical info. */
export function RideDaySection({ practice }: { practice: Practice }) {
  return (
    <section className="clip-slant-t relative -mt-[4vw] bg-bone pb-24 pt-[calc(4vw+5rem)] text-ink md:pb-32 md:pt-[calc(4vw+7rem)]">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="grid gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow text-brand">Ride day</p>
            <h2 className="display mt-4 text-[clamp(3rem,7vw,6.5rem)]">
              Load up.
              <br />
              Show up.
              <br />
              <span className="text-brand">Ride.</span>
            </h2>
            <Button asChild variant="race" size="xl" className="mt-10 bg-ink text-white hover:bg-brand">
              <Link href="/register">
                Register now <ArrowRight aria-hidden />
              </Link>
            </Button>
          </Reveal>

          <ol className="space-y-px overflow-hidden rounded-sm bg-ink/10 lg:col-span-7">
            {steps.map((step, i) => (
              <RevealLi key={step.title} delay={i * 0.08} className="flex gap-6 bg-bone py-7 md:gap-10">
                  <span className="display w-14 shrink-0 text-6xl text-ink/15 md:w-20 md:text-7xl">0{i + 1}</span>
                  <div>
                    <h3 className="flex items-center gap-3 font-display text-2xl font-bold uppercase italic">
                      <step.icon className="size-5 text-brand" aria-hidden />
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-md text-ink/70">{step.body}</p>
                  </div>
              </RevealLi>
            ))}
          </ol>
        </div>

        {/* Price + hours board */}
        <Reveal className="mt-20 grid overflow-hidden rounded-sm bg-ink text-white md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Main track", value: formatPrice(practice.prices.main), sub: "per class" },
            { label: "Junior track", value: formatPrice(practice.prices.junior), sub: "per rider" },
            { label: "Spectators", value: formatPrice(practice.prices.spectator), sub: "5 & under free" },
          ].map((p) => (
            <div key={p.label} className="border-b border-white/10 p-7 md:border-r lg:border-b-0">
              <p className="eyebrow text-white/50">{p.label}</p>
              <p className="display mt-3 text-6xl text-volt">{p.value}</p>
              <p className="mt-1 text-sm text-white/60">{p.sub}</p>
            </div>
          ))}
          <div className="p-7">
            <p className="eyebrow text-white/50">Regular hours</p>
            <ul className="mt-4 space-y-2">
              {practice.hours.map((h) => (
                <li key={h.day} className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-2 last:border-0">
                  <span className="font-display text-lg font-semibold uppercase italic">{h.day}</span>
                  <span className="text-sm text-white/75">{formatTimeRange(h.open, h.close)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-white/50">{practice.hoursNote}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
