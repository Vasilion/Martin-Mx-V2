import Image from "next/image";
import { getSponsors } from "@/lib/content/loader";

export default async function SponsorsPage() {
  const sponsors = (await getSponsors()).filter((s) => s.isActive);
  const titleSponsors = sponsors.filter((s) => s.isTitleSponsor);

  return (
    <section className="space-y-4 text-white">
      <h1 className="text-3xl font-bold">Sponsors</h1>
      {titleSponsors.length > 0 ? (
        <div className="rounded border border-green-600/60 bg-zinc-900 p-4">
          <h2 className="text-xl font-semibold text-green-300">Title Sponsors</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {titleSponsors.map((sponsor) => (
              <a key={sponsor.id} href={sponsor.href} className="rounded border border-zinc-700 bg-zinc-950 p-3">
                <div className="relative h-20 w-full bg-zinc-800">
                  <Image src={sponsor.logo} alt={sponsor.name} fill sizes="30vw" />
                </div>
                <p className="mt-2 text-sm">{sponsor.name}</p>
              </a>
            ))}
          </div>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        {sponsors.map((sponsor) => (
          <a key={sponsor.id} href={sponsor.href} className="rounded border border-zinc-700 bg-zinc-900 p-4">
            <div className="relative h-20 w-full bg-zinc-800">
              <Image src={sponsor.logo} alt={sponsor.name} fill sizes="30vw" />
            </div>
            <p className="mt-2 text-sm">{sponsor.name}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
