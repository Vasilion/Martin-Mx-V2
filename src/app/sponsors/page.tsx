import Image from "next/image";
import { getSponsors } from "@/lib/content/loader";

export default async function SponsorsPage() {
  const sponsors = (await getSponsors()).filter((s) => s.isActive);
  const titleSponsors = sponsors.filter((s) => s.isTitleSponsor);
  const marqueeSponsors = [...sponsors, ...sponsors];

  return (
    <section className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <h1 className="text-3xl font-bold md:text-4xl">Sponsors</h1>
        <p className="mt-2 text-sm text-zinc-300 md:text-base">
          Partners that help power practice days, events, and rider growth at Martin MX Park.
        </p>
      </header>
      {titleSponsors.length > 0 ? (
        <div className="rounded-2xl border border-green-600/50 bg-zinc-900/75 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
          <h2 className="text-xl font-semibold text-green-300">Title Sponsors</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {titleSponsors.map((sponsor) => (
              <a
                key={sponsor.id}
                href={sponsor.href}
                className="rounded-xl border border-zinc-700 bg-zinc-950/80 p-3 transition hover:border-zinc-500"
              >
                <div className="relative aspect-[3/2] w-full rounded bg-zinc-800">
                  <Image src={sponsor.logo} alt={sponsor.name} fill sizes="30vw" className="object-contain p-3" />
                </div>
                <p className="mt-2 text-sm">{sponsor.name}</p>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/75 py-5 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <div className="mx-marquee-track flex items-center gap-6 px-4">
          {marqueeSponsors.map((sponsor, index) => (
            <a
              key={`${sponsor.id}-${index}`}
              href={sponsor.href}
              className="flex h-20 w-44 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950/80 p-3"
            >
              <div className="relative h-full w-full">
                <Image src={sponsor.logo} alt={sponsor.name} fill sizes="176px" className="object-contain" />
              </div>
            </a>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {sponsors.map((sponsor) => (
          <a
            key={sponsor.id}
            href={sponsor.href}
            className="rounded-2xl border border-white/10 bg-zinc-900/75 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur transition hover:border-zinc-500"
          >
            <div className="relative aspect-[3/2] w-full rounded bg-zinc-800">
              <Image src={sponsor.logo} alt={sponsor.name} fill sizes="30vw" className="object-contain p-3" />
            </div>
            <p className="mt-2 text-sm">{sponsor.name}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
