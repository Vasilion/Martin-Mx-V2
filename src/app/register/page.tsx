import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/site/page-header";
import { PracticeForm, type ClassOption, type OpenDay } from "@/components/register/practice-form";
import { PracticeClosed } from "@/components/register/practice-closed";
import { MembershipPanel } from "@/components/register/membership-panel";
import { getMembership, getPractice, getSchedule, parkNow, resolveTrackStatus } from "@/lib/park/live";

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
  const tab: Tab = params.tab === "membership" ? "membership" : "practice";
  const [schedule, practice, membership] = await Promise.all([getSchedule(), getPractice(), getMembership()]);
  const { date: today, time } = parkNow();
  const status = resolveTrackStatus(schedule);

  // Ride days still ahead (today counts until it ends), not cancelled.
  const upcoming = schedule.filter((d) => !d.cancelled && (d.date > today || (d.date === today && d.end > time)));
  const openDays: OpenDay[] = upcoming
    .filter((d) => d.registrationOpen)
    .map((d) => ({ date: d.date, start: d.start, end: d.end, title: d.title }));
  const classes: ClassOption[] = practice.classes.map((c) => ({
    ...c,
    price: c.track === "main" ? practice.prices.main : practice.prices.junior,
  }));

  const tabs: { id: Tab; label: string; sub: string }[] = [
    { id: "practice", label: "Practice day", sub: openDays.length ? `${openDays.length} day${openDays.length > 1 ? "s" : ""} open` : "Opens before each ride day" },
    { id: "membership", label: "Membership", sub: membership.open ? "Unlimited · all season" : "Not on sale" },
  ];

  return (
    <>
      <PageHeader
        compact
        eyebrow="Register"
        title="Get on"
        accent="the gate list."
        image="/photos/roost-292.jpg"
        imagePosition="center 30%"
      />

      <section className="bg-ink pb-24 md:pb-32">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <nav aria-label="Registration type" className="-mt-px grid grid-cols-2 border-b border-white/10 sm:flex">
            {tabs.map((t) => (
              <Link
                key={t.id}
                href={t.id === "practice" ? "/register" : "/register?tab=membership"}
                scroll={false}
                aria-current={tab === t.id ? "page" : undefined}
                className={cn(
                  "relative px-1 py-5 transition-colors sm:mr-10",
                  tab === t.id ? "text-white" : "text-white/45 hover:text-white/80",
                  "after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:bg-volt after:transition-transform",
                  tab === t.id ? "after:scale-x-100" : "after:scale-x-0",
                )}
              >
                <span className="block font-display text-2xl font-bold uppercase italic md:text-3xl">{t.label}</span>
                <span className="eyebrow mt-1 block text-[0.65rem] text-white/45">{t.sub}</span>
              </Link>
            ))}
          </nav>

          <div className="pt-10 md:pt-14">
            {tab === "membership" ? (
              <MembershipPanel membership={membership} />
            ) : openDays.length > 0 ? (
              <PracticeForm days={openDays} classes={classes} initialDate={params.day} />
            ) : (
              <PracticeClosed status={status} upcoming={upcoming} practice={practice} membership={membership} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
