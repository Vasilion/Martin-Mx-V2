"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Reveal } from "@/components/motion/reveal";
import { park } from "@/lib/park/facts";

/**
 * Full-bleed drone flyover with the 3D track model behind a click-to-load dialog,
 * so the heavy Sketchfab embed never costs anything until someone asks for it.
 */
export function WalkTheTrack() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  // Only stream the (externally hosted) flyover while it's on screen.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <div className="relative h-[85svh] min-h-[560px] w-full">
        <video
          ref={videoRef}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          src={park.droneVideo.src}
          poster="/media/gallery/track-photo.jpg"
          muted
          loop
          playsInline
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/30 to-ink/70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />

        <div className="mx-auto flex h-full max-w-[1440px] flex-col justify-end px-4 pb-14 md:px-8 md:pb-20">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-volt">Know it before you unload</p>
            <h2 className="display mt-4 text-[clamp(3rem,8vw,7.5rem)] text-white">Walk the track.</h2>
            <p className="mt-5 max-w-lg text-lg text-white/75">
              Spin the 3D model, study the lines, then come ride it.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 flex flex-wrap items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="race" size="xl">
                  <Box aria-hidden /> Open 3D track map
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[min(96vw,1200px)] border-white/10 bg-ink p-0 sm:max-w-[min(96vw,1200px)]">
                <DialogTitle className="sr-only">Martin MX 3D track map</DialogTitle>
                <div className="aspect-[4/3] w-full sm:aspect-video">
                  <iframe
                    title="Martin MX interactive 3D track map"
                    src={park.trackModelUrl}
                    className="h-full w-full rounded-sm"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    allowFullScreen
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="race-outline"
              size="xl"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                if (v.paused) v.play().catch(() => {});
                else v.pause();
              }}
              aria-label={playing ? "Pause flyover video" : "Play flyover video"}
            >
              {playing ? <Pause aria-hidden /> : <Play aria-hidden />} Flyover
            </Button>
          </Reveal>
          <p className="mt-6 text-xs text-white/45">
            Drone footage by{" "}
            <a href={park.droneVideo.creditUrl} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
              {park.droneVideo.credit}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
