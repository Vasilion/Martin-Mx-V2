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
import { getContent, getSite } from "@/lib/park/content";
import { pageMetadata } from "@/lib/seo";
import { practiceRegistrationOpen } from "@/lib/registrations/availability";

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
  const [schedule, practice, membership, sponsors, weather, site, home, tracks, gallery, registerOpen] = await Promise.all([
    getSchedule(),
    getPractice(),
    getMembership(),
    getSponsors(),
    getWeather(),
    getSite(),
    getContent("home"),
    getContent("tracks"),
    getContent("gallery"),
    practiceRegistrationOpen(),
  ]);
  const status = resolveTrackStatus(schedule);

  const ticker = [
    ...practice.hours.map((h) => `${h.day.slice(0, 3)} ${formatTimeRange(h.open, h.close)}`),
    ...home.ticker,
  ];

  return (
    <>
      <Hero status={status} weather={weather} home={home} facebook={site.facebook} registerOpen={registerOpen} />
      {/* The tilted strip bleeds past both edges; clip sideways only so the corners still overlap above and below. */}
      <div className="overflow-x-clip">
        <Marquee items={ticker} className="-rotate-1 scale-[1.02] bg-volt text-ink" />
      </div>
      <TracksSection practice={practice} tracks={tracks} home={home} />
      <WalkTheTrack eyebrow={home.flyoverEyebrow} heading={home.flyoverHeading} body={home.flyoverBody} />
      <RideDaySection practice={practice} registerOpen={registerOpen} />
      <MembershipBand membership={membership} />
      <GalleryStrip heading={home.galleryHeading} shots={gallery.items.filter((g) => g.featured).slice(0, 10)} />
      <VisitSection sponsors={sponsors} site={site} home={home} />
    </>
  );
}
