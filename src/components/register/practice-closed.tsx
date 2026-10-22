import Link from "next/link";
import { ArrowDownToLine, ArrowRight, CalendarClock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Membership, Practice, RideDay, TrackStatus } from "@/lib/park/live";
import { formatDay, formatPrice, formatTimeRange, monthDay, weekdayOf } from "@/lib/park/format";
import type { SiteInfo } from "@/lib/park/content";

/**
 * Shown when no ride day has online registration open, or the owners switched
 * practice registration off for the whole site (`switchedOff`). Riders still leave with
 * everything they need: when the next ride day is, what it costs, what to bring.
 */
export function PracticeClosed({
  switchedOff = false,
  status,
  upcoming,
  practice,
  membership,
  site,
  gear,
  waivers,
}: {
  switchedOff?: boolean;
  site: SiteInfo;
  gear: string[];
  waivers: { id: string; label: string; note: string; href: string }[];
  status: TrackStatus;
  upcoming: RideDay[];
  practice: Practice;
  membership: Membership;
}) {
  const next = status.kind === "off-season" ? null : status.kind === "cancelled" ? status.next : status.day;

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="space-y-10 lg:col-span-8">
        {/* Status */}
        <section className="overflow-hidden rounded-sm border border-white/12 bg-ink-2">
          <div className="h-1 bg-caution" aria-hidden />
          <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
            <div>
              <p className="eyebrow flex items-center gap-2 text-caution">
                <CalendarClock className="size-4" aria-hidden /> {switchedOff ? "Practice registration is closed" : "Online registration isn’t open yet"}
              </p>
              <h2 className="display mt-4 text-4xl text-white md:text-5xl">
                {switchedOff
                  ? "Online sign-ups aren’t open right now."
                  : next
                    ? "Registration opens before each ride day."
                    : "Season's wrapped. See you in spring."}
              </h2>
              <p className="mt-4 max-w-xl text-white/65">
                {switchedOff
                  ? "When practice registration opens again, the form appears right here. Watch the schedule and Facebook for updates."
                  : next
                    ? "Once the park opens sign-ups for a day, the form appears right here. Check back closer to the day, or follow along on the schedule."
                    : "New dates and registration post here and on Facebook first."}
              </p>
            </div>
            {next && (
              <div className="rounded-sm border border-white/10 bg-ink p-5 md:min-w-56">
                <p className="eyebrow text-[0.65rem] text-white/50">Next ride day</p>
                <div className="mt-2 flex items-end gap-3">
                  <span className="display text-6xl leading-[0.8] text-white">{monthDay(next.date).day}</span>
                  <span className="pb-0.5">
                    <span className="block font-display text-xl font-bold uppercase italic text-white">{weekdayOf(next.date, "long")}</span>
                    <span className="block text-sm text-white/60">
                      {monthDay(next.date).month} · {formatTimeRange(next.start, next.end)}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
          {upcoming.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-6 py-4 md:px-8">
              <span className="eyebrow mr-2 text-[0.65rem] text-white/45">Also on the schedule</span>
              {upcoming.slice(1, 5).map((d) => (
                <span key={d.id} className="rounded-sm border border-white/12 px-2.5 py-1 text-xs text-white/70">
                  {formatDay(d.date)} · {formatTimeRange(d.start, d.end)}
                </span>
              ))}
              <Link href="/schedule" className="eyebrow ml-auto flex items-center gap-1.5 text-[0.7rem] text-white/80 hover:text-volt">
                Full schedule <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          )}
        </section>

        {/* Before you come */}
        <section>
          <h2 className="font-display text-2xl font-bold uppercase italic text-white md:text-3xl">Before you come</h2>
          <div className="mt-6 grid gap-px overflow-hidden rounded-sm bg-white/10 md:grid-cols-3">
            <div className="bg-ink-2 p-6">
              <p className="eyebrow text-[0.7rem] text-white/50">Pricing</p>
              <ul className="mt-4 space-y-3">
                {[
                  ["Main track", formatPrice(practice.prices.main), "/ class"],
                  ["Junior track", formatPrice(practice.prices.junior), "/ rider"],
                  ["Spectators", formatPrice(practice.prices.spectator), "5 & under free"],
                ].map(([label, price, sub]) => (
                  <li key={label} className="flex items-baseline justify-between gap-3">
                    <span className="text-white/75">{label}</span>
                    <span className="text-right">
                      <span className="display text-2xl text-volt">{price}</span>
                      <span className="ml-1.5 text-xs text-white/45">{sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-ink-2 p-6">
              <p className="eyebrow text-[0.7rem] text-white/50">Required gear</p>
              <ul className="mt-4 space-y-2">
                {gear.slice(0, 5).map((g) => (
                  <li key={g} className="flex items-center gap-2.5 text-sm text-white/75">
                    <Check className="size-4 shrink-0 text-volt" strokeWidth={3} aria-hidden /> {g}
                  </li>
                ))}
              </ul>
              <Link href="/track-info#gear" className="eyebrow mt-4 inline-block text-[0.65rem] text-white/60 hover:text-volt">
                Full list →
              </Link>
            </div>
            <div className="bg-ink-2 p-6">
              <p className="eyebrow text-[0.7rem] text-white/50">Waivers</p>
              <ul className="mt-4 space-y-2.5">
                {waivers.map((w) => (
                  <li key={w.id}>
                    <a href={w.href} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-3 text-sm text-white/80 hover:text-white">
                      <span>
                        {w.label}
                        <span className="block text-xs text-white/45">{w.note}</span>
                      </span>
                      <ArrowDownToLine className="size-4 shrink-0 text-volt transition-transform group-hover:translate-y-0.5" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Membership promo */}
      <aside className="lg:col-span-4">
        {membership.open && (
          <div className="grain relative overflow-hidden rounded-sm bg-brand p-7 lg:sticky lg:top-28">
            <p className="eyebrow text-white/80">Ride all season</p>
            <p className="display mt-3 text-5xl text-white">Unlimited membership</p>
            <p className="mt-5 flex items-baseline gap-2">
              <span className="display text-6xl text-white">{formatPrice(membership.price)}</span>
              <span className="eyebrow text-white/80">/ year</span>
            </p>
            <ul className="mt-5 space-y-2">
              {membership.perks.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-white">
                  <Check className="size-4 shrink-0" strokeWidth={3} aria-hidden /> {p}
                </li>
              ))}
            </ul>
            <Button asChild variant="race" size="xl" className="mt-7 w-full bg-ink text-white hover:bg-white hover:text-ink">
              <Link href="/register?tab=membership">
                Become a member <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        )}
        <p className="mt-5 text-sm text-white/50">
          Questions? Call{" "}
          <a href={site.phoneHref} className="text-white/80 hover:text-volt">
            {site.phone}
          </a>
          .
        </p>
      </aside>
    </div>
  );
}
