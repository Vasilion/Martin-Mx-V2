import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { TracksSection } from "@/components/home/tracks-section";
import { WalkTheTrack } from "@/components/home/walk-the-track";
import { RideDaySection } from "@/components/home/ride-day-section";
import { MembershipBand } from "@/components/home/membership-band";
import { GalleryStrip } from "@/components/home/gallery-strip";
import { VisitSection } from "@/components/home/visit-section";
import { Marquee } from "@/components/site/marquee";
import { getMembership, getPractice, getSchedule, getSponsors, resolveTrackStatus } from "@/lib/park/live";
import { getWeather } from "@/lib/park/weather";
import { formatTimeRange } from "@/lib/park/format";
import { park } from "@/lib/park/facts";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  description:
    "Two motocross tracks just off US-131 in Martin, Michigan. Live track status, open practice, a dedicated junior track and yearly memberships.",
  path: "/",
  og: "home",
});

// Track status depends on today's date at the park, so re-render at most once a minute.
// Owner edits in the dashboard must show immediately; data is a couple of DynamoDB reads.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [schedule, practice, membership, sponsors, weather] = await Promise.all([
    getSchedule(),
    getPractice(),
    getMembership(),
    getSponsors(),
    getWeather(),
  ]);
  const status = resolveTrackStatus(schedule);

  const ticker = [
    ...practice.hours.map((h) => `${h.day.slice(0, 3)} ${formatTimeRange(h.open, h.close)}`),
    "Two tracks",
    "Junior track",
    `${park.address.city}, ${park.address.region}`,
    "Off US-131",
  ];

  return (
    <>
      <Hero status={status} weather={weather} />
      <Marquee items={ticker} className="-rotate-1 scale-[1.02] bg-volt text-ink" />
      <TracksSection practice={practice} />
      <WalkTheTrack />
      <RideDaySection practice={practice} />
      <MembershipBand membership={membership} />
      <GalleryStrip />
      <VisitSection sponsors={sponsors} />
    </>
  );
}
