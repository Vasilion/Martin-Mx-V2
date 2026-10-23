import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import type { Membership } from "@/lib/park/live";
import { formatPrice } from "@/lib/park/format";

export function MembershipBand({ membership }: { membership: Membership }) {
  if (!membership.open) return null;
  return (
    <section className="grain relative isolate overflow-hidden bg-brand">
      <Image
        src="/photos/roost-292.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-[70%_center] opacity-35 mix-blend-luminosity"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand via-brand/85 to-brand/20" />
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-24 md:px-8 md:py-32 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow text-white/80">Yearly membership</p>
          <h2 className="display mt-4 text-[clamp(1.75rem,calc((100vw-2rem)/5.6),3.25rem)] sm:text-[clamp(3.25rem,8vw,8rem)] text-white">
            Unlimited.
            <br />
            All season.
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col justify-end lg:items-end">
          <div className="w-full max-w-md">
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="display text-[clamp(4rem,26vw,6rem)] text-white">{formatPrice(membership.price)}</span>
              <span className="eyebrow text-white/80">/ year</span>
            </p>
            <ul className="mt-6 space-y-3">
              {membership.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-lg text-white">
                  <Check className="size-5 shrink-0" aria-hidden /> {perk}
                </li>
              ))}
            </ul>
            <Button asChild variant="race" size="xl" className="mt-8 bg-ink text-white hover:bg-white hover:text-ink">
              <Link href="/register?tab=membership">
                Become a member <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
