import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { TrackStatusCard, TrackStatusChip } from "@/components/home/track-status-card";
import type { TrackStatus } from "@/lib/park/live";
import type { Weather } from "@/lib/park/weather";
import type { Content } from "@/lib/park/content";
import { isRemote } from "@/lib/media";

/**
 * Desktop: the status card floats in the dark right side of the photo.
 * Mobile: the photo stays clear (rider fully visible), a status chip sits with the
 * headline, and the full card follows directly below the hero.
 */
export function Hero({
  status,
  weather,
  home,
  facebook,
  registerOpen,
}: {
  status: TrackStatus;
  weather: Weather | null;
  home: Content<"home">;
  facebook: string;
  registerOpen: boolean;
}) {
  return (
    <>
      <section className="grain relative isolate overflow-hidden bg-ink">
        <div className="absolute inset-0 -z-10">
          <Image
            src={home.heroImage}
            unoptimized={isRemote(home.heroImage)}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[30%_20%] opacity-90 lg:object-[22%_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent lg:via-ink/40" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-transparent to-ink/60 lg:block" />
        </div>

        <div className="mx-auto flex min-h-[88svh] max-w-[1440px] flex-col px-4 pb-10 pt-28 md:px-8 md:pb-14 md:pt-32 lg:min-h-[100svh]">
          <div className="hidden flex-1 items-start justify-end lg:flex">
            <Reveal delay={0.35} className="mt-[6vh] w-full max-w-md">
              <TrackStatusCard status={status} weather={weather} facebook={facebook} />
            </Reveal>
          </div>
          <div className="flex-1 lg:hidden" aria-hidden />

          <div className="lg:-mt-24">
            <Reveal className="mb-6 lg:hidden">
              <TrackStatusChip status={status} href="#track-status" />
            </Reveal>
            <Reveal>
              <p className="eyebrow flex items-center gap-3 text-white/70">
                <span className="h-px w-10 bg-volt" aria-hidden />
                {home.heroEyebrow}
              </p>
            </Reveal>
            <h1 className="display mt-4 text-[clamp(3.75rem,min(11.5vw,16vh),12rem)] text-white">
              <Reveal delay={0.08}>
                <span className="block">{home.heroLine1}</span>
              </Reveal>
              <Reveal delay={0.16}>
                <span className="block text-volt">{home.heroLine2}</span>
              </Reveal>
            </h1>
            <Reveal delay={0.28} className="mt-6 flex flex-wrap items-center gap-3">
              {registerOpen ? (
                <Button asChild variant="race" size="2xl">
                  <Link href="/register">
                    Register to ride <ArrowRight aria-hidden />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="race" size="2xl">
                  <Link href="/schedule">
                    Ride schedule <ArrowRight aria-hidden />
                  </Link>
                </Button>
              )}
              <Button asChild variant="race-outline" size="2xl">
                <Link href="/track-info">Track info</Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      <div id="track-status" className="scroll-mt-20 bg-ink px-4 pb-12 lg:hidden">
        <TrackStatusCard status={status} weather={weather} facebook={facebook} />
      </div>
    </>
  );
}
