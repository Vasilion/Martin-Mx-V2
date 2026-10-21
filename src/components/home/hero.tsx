import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { TrackStatusCard } from "@/components/home/track-status-card";
import type { TrackStatus } from "@/lib/park/live";
import type { Weather } from "@/lib/park/weather";

export function Hero({ status, weather }: { status: TrackStatus; weather: Weather | null }) {
  return (
    <section className="grain relative isolate overflow-hidden bg-ink">
      {/* B&W rider fills the frame; the dark right side is where the status card lives. */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/photos/hero-bw.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[22%_30%] opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-ink/60" />
      </div>

      <div className="mx-auto flex min-h-[100svh] max-w-[1440px] flex-col px-4 pb-10 pt-28 md:px-8 md:pb-14 md:pt-32">
        <div className="flex flex-1 flex-col gap-10 lg:flex-row lg:items-start lg:justify-end">
          <Reveal delay={0.35} className="order-2 w-full max-w-md self-stretch lg:order-1 lg:mt-[6vh] lg:self-auto">
            <TrackStatusCard status={status} weather={weather} />
          </Reveal>
        </div>

        <div className="mt-12 lg:-mt-24">
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-white/70">
              <span className="h-px w-10 bg-volt" aria-hidden />
              Martin, Michigan · Two tracks · Off US-131
            </p>
          </Reveal>
          <h1 className="display mt-4 text-[clamp(3.75rem,min(11.5vw,16vh),12rem)] text-white">
            <Reveal delay={0.08}>
              <span className="block">This is</span>
            </Reveal>
            <Reveal delay={0.16}>
              <span className="block text-volt">motocross.</span>
            </Reveal>
          </h1>
          <Reveal delay={0.28} className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild variant="race" size="2xl">
              <Link href="/register">
                Register to ride <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="race-outline" size="2xl">
              <Link href="/track-info">Track info</Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
