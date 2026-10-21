import type { Metadata } from "next";
import { Clock, Flag, Users } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { HiringForm } from "@/components/forms/hiring-form";
import { getContent, getSite } from "@/lib/park/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Work With Us",
  description: "Apply to work at Martin MX Park: flaggers, rider registration and more.",
  path: "/hiring",
  og: "hiring",
});

export const dynamic = "force-dynamic";

export default async function HiringPage() {
  const [hiring, site] = await Promise.all([getContent("hiring"), getSite()]);
  return (
    <>
      <PageHeader compact eyebrow="Work with us" title="Work" accent="the track." image="/media/gallery/strapi-main-1.jpg" imagePosition="center 60%" />
      <section className="bg-ink pb-24 pt-12 md:pb-32 md:pt-16">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-4 md:px-8 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-28">
              <p className="text-lg text-white/80">{hiring.intro}</p>
              <ul className="space-y-4 border-y border-white/10 py-6">
                <li className="flex gap-3">
                  <Flag className="mt-0.5 size-5 shrink-0 text-volt" aria-hidden />
                  <span>
                    <span className="eyebrow block text-[0.65rem] text-white/50">Positions</span>
                    <span className="text-white">{hiring.positions.join(" · ")}</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-volt" aria-hidden />
                  <span>
                    <span className="eyebrow block text-[0.65rem] text-white/50">When</span>
                    <span className="text-white">Ride days during the season</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Users className="mt-0.5 size-5 shrink-0 text-volt" aria-hidden />
                  <span>
                    <span className="eyebrow block text-[0.65rem] text-white/50">Who</span>
                    <span className="text-white">16 and older</span>
                  </span>
                </li>
              </ul>
              <p className="text-sm text-white/50">
                Questions? Call{" "}
                <a href={site.phoneHref} className="text-white/80 hover:text-volt">
                  {site.phone}
                </a>
                .
              </p>
            </div>
          </aside>
          <div className="lg:col-span-7 lg:col-start-6">
            {hiring.open ? (
              <HiringForm positions={hiring.positions} availability={hiring.availability} />
            ) : (
              <div className="rounded-sm border border-white/12 bg-ink-2 p-8">
                <p className="display text-4xl text-white">Not hiring right now.</p>
                <p className="mt-3 text-white/65">Check back before the next season. Thanks for your interest in working at Martin MX.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
