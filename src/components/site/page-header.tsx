import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";

/** Editorial inner-page header: photo band, eyebrow, oversized title, optional intro + actions. */
export function PageHeader({
  eyebrow,
  title,
  accent,
  intro,
  image,
  imagePosition = "center",
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  intro?: ReactNode;
  image: string;
  imagePosition?: string;
  children?: ReactNode;
}) {
  return (
    <header className="grain clip-slant-b relative isolate overflow-hidden bg-ink pb-[calc(4vw+3.5rem)] pt-32 md:pb-[calc(4vw+5rem)] md:pt-44">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ objectPosition: imagePosition }}
        className="-z-10 object-cover opacity-45"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-white/70">
            <span className="h-px w-10 bg-volt" aria-hidden />
            {eyebrow}
          </p>
          <h1 className="display mt-5 text-[clamp(3.5rem,10vw,9.5rem)] text-white">
            {title}
            {accent && <span className="block text-volt">{accent}</span>}
          </h1>
        </Reveal>
        {intro && (
          <Reveal delay={0.1}>
            <div className="mt-6 max-w-2xl text-lg text-white/75 md:text-xl">{intro}</div>
          </Reveal>
        )}
        {children && <Reveal delay={0.16} className="mt-8">{children}</Reveal>}
      </div>
    </header>
  );
}
