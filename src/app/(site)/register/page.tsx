import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/site/page-header";
import { PracticeForm, type ClassOption, type OpenDay } from "@/components/register/practice-form";
import { PracticeClosed } from "@/components/register/practice-closed";
import { MembershipPanel } from "@/components/register/membership-panel";
import { getMembership, getSchedule, parkNow, resolveTrackStatus } from "@/lib/park/live";
import { getOpenDays } from "@/lib/registrations/availability";
import { getContent, getSite } from "@/lib/park/content";

export const metadata: Metadata = pageMetadata({
  title: "Register",
  description:
    "Register for open practice at Martin MX Park or buy a yearly unlimited membership online.",
  path: "/register",
  og: "register",
});

export const dynamic = "force-dynamic";

type Tab = "practice" | "membership";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; day?: string }>;
}) {
  const params = await searchParams;
  const [schedule, { days: open, practice }, membership, site, info, { items: waivers }] = await Promise.all([
    getSchedule(),
    getOpenDays(),
    getMembership(),
    getSite(),
    getContent("trackInfo"),
    getContent("waivers"),
  ]);
  const { date: today, time } = parkNow();
  const status = resolveTrackStatus(schedule);

  // Ride days still ahead (today counts until it ends), not cancelled.
  const upcoming = schedule.filter((d) => !d.cancelled && (d.date > today || (d.date === today && d.end > time)));
  const openDays: OpenDay[] = open.map((d) => ({ date: d.date, start: d.start, end: d.end, title: d.title, spotsLeft: d.spotsLeft }));
  const practiceOpen = openDays.length > 0;
  // With nothing to sign up for, lead with what riders can buy: the membership.
  const tab: Tab = params.tab === "membership" || (params.tab !== "practice" && !practiceOpen) ? "membership" : "practice";
  const header =
    tab === "membership"
      ? { eyebrow: "Membership", title: "Ride all", accent: "season." }
      : practiceOpen
        ? { eyebrow: "Register", title: "Get on", accent: "the gate list." }
        : { eyebrow: "Practice", title: "Ride day", accent: "info." };
  const classes: ClassOption[] = practice.classes.map((c) => ({
    ...c,
    price: c.track === "main" ? practice.prices.main : practice.prices.junior,
  }));

  const tabs: { id: Tab; label: string; sub: string }[] = [
    {
      id: "practice",
      label: "Practice",
      sub: practiceOpen ? `${openDays.length} day${openDays.length > 1 ? "s" : ""} open` : "Not open online",
    },
    { id: "membership", label: "Membership", sub: membership.open ? "Unlimited · all season" : "Not on sale" },
  ];

  return (
    <>
      <PageHeader
        compact
        eyebrow={header.eyebrow}
        title={header.title}
        accent={header.accent}
        image="/photos/roost-292.jpg"
        imagePosition="center 30%"
      />

      <section className="bg-ink pb-24 md:pb-32">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <nav aria-label="Registration type" className="-mt-px grid grid-cols-2 border-b border-white/10 sm:flex">
            {tabs.map((t) => (
              <Link
                key={t.id}
                href={t.id === "practice" ? "/register?tab=practice" : "/register?tab=membership"}
                scroll={false}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "relative py-5 pr-3 transition-colors max-sm:@container sm:mr-10 sm:pr-1",
                  tab === t.id ? "text-white" : "text-white/45 hover:text-white/80",
                  "after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:bg-volt after:transition-transform",
                  tab === t.id ? "after:scale-x-100" : "after:scale-x-0",
                )}
              >
                <span className="block whitespace-nowrap font-display text-[min(1.5rem,15.5cqi)] font-bold uppercase italic leading-tight md:text-3xl">{t.label}</span>
                <span className="eyebrow mt-1 block text-[0.65rem] text-white/45">{t.sub}</span>
              </Link>
            ))}
          </nav>

          <div className="pt-10 md:pt-14">
            {tab === "membership" ? (
              <MembershipPanel membership={membership} phone={site.phone} phoneHref={site.phoneHref} />
            ) : practiceOpen ? (
              <PracticeForm days={openDays} classes={classes} initialDate={params.day} />
            ) : (
              <PracticeClosed status={status} upcoming={upcoming} practice={practice} membership={membership} site={site} gear={info.gear} waivers={waivers} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
