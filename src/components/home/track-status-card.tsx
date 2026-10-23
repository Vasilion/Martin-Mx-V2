import Link from "next/link";
import { ArrowRight, CloudRain, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RideDay, TrackStatus } from "@/lib/park/live";
import { describeWeather, type Weather } from "@/lib/park/weather";
import { formatDay, formatTime, formatTimeRange, weekdayOf, monthDay } from "@/lib/park/format";

type Tone = "go" | "stop" | "wait";

const toneStyles: Record<Tone, { dot: string; text: string; bar: string }> = {
  go: { dot: "bg-volt text-volt", text: "text-volt", bar: "bg-volt" },
  stop: { dot: "bg-danger text-danger", text: "text-danger", bar: "bg-danger" },
  wait: { dot: "bg-caution text-caution", text: "text-caution", bar: "bg-caution" },
};

function StatusLine({ tone, label, pulse }: { tone: Tone; label: string; pulse?: boolean }) {
  return (
    <p className={cn("eyebrow flex items-center gap-2.5", toneStyles[tone].text)}>
      <span className={cn("size-2.5 rounded-full", toneStyles[tone].dot, pulse && "animate-pulse-dot")} aria-hidden />
      {label}
    </p>
  );
}

function Forecast({ weather, date }: { weather: Weather | null; date: string }) {
  const day = weather?.days.find((d) => d.date === date);
  if (!day) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
      <span className="font-semibold text-white">
        {day.highF}° / {day.lowF}°
      </span>
      <span>{describeWeather(day.code)}</span>
      <span className="flex items-center gap-1">
        <CloudRain className="size-3.5" aria-hidden /> {day.rainChance}%
      </span>
    </div>
  );
}

function BigDate({ day }: { day: RideDay }) {
  const { month, day: dom } = monthDay(day.date);
  return (
    <div className="flex items-end gap-3 @container sm:gap-4">
      <p className="display shrink-0 text-[min(5.5rem,24cqi)] leading-[0.8] text-white">{dom}</p>
      <div className="min-w-0 pb-1">
        <p className="display whitespace-nowrap text-[min(1.875rem,9.5cqi)] text-white">{weekdayOf(day.date, "long")}</p>
        <p className="eyebrow mt-1 whitespace-nowrap text-[min(0.75rem,4.6cqi)] tracking-[0.14em] text-white/60">
          {month} · {formatTimeRange(day.start, day.end)}
        </p>
      </div>
    </div>
  );
}

function toneOf(status: TrackStatus): Tone {
  if (status.kind === "riding-now" || status.kind === "today") return "go";
  if (status.kind === "cancelled") return "stop";
  return "wait";
}

/** One-line status for tight spots (the mobile hero), linking down to the full card. */
export function TrackStatusChip({ status, href }: { status: TrackStatus; href: string }) {
  const tone = toneOf(status);
  const label =
    status.kind === "riding-now"
      ? `Open now · till ${formatTime(status.day.end)}`
      : status.kind === "today"
        ? `Riding today · ${formatTimeRange(status.day.start, status.day.end)}`
        : status.kind === "cancelled"
          ? "Practice cancelled today"
          : status.kind === "upcoming"
            ? `Next ride · ${formatDay(status.day.date)}`
            : "Off season";
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2.5 rounded-sm border border-white/15 bg-ink/70 px-3.5 py-2 backdrop-blur-md transition hover:border-white/40"
    >
      <span className={cn("size-2 rounded-full", toneStyles[tone].dot, tone === "go" && "animate-pulse-dot")} aria-hidden />
      <span className={cn("eyebrow text-[0.7rem]", toneStyles[tone].text)}>{label}</span>
      <ArrowRight className="size-3.5 rotate-90 text-white/60" aria-hidden />
    </a>
  );
}

export function TrackStatusCard({ status, weather, facebook = "" }: { status: TrackStatus; weather: Weather | null; facebook?: string }) {
  const tone = toneOf(status);

  return (
    <section
      aria-label="Track status"
      className="relative overflow-hidden rounded-sm border border-white/12 bg-ink/75 shadow-2xl shadow-black/60 backdrop-blur-xl"
    >
      <div className={cn("h-1 w-full", toneStyles[tone].bar)} aria-hidden />
      <div className="space-y-5 p-5 sm:p-6 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="eyebrow text-white/50">Track status</p>
          {weather && (
            <p className="flex items-center gap-3 whitespace-nowrap text-xs text-white/60">
              <span>
                Now <span className="font-semibold text-white">{weather.current.tempF}°F</span>
              </span>
              <span className="flex items-center gap-1">
                <Wind className="size-3.5" aria-hidden /> {weather.current.windMph} mph
              </span>
            </p>
          )}
        </div>

        {status.kind === "riding-now" && (
          <>
            <StatusLine tone="go" label="Open · riding now" pulse />
            <p className="display text-5xl text-white">
              Gate&apos;s open
              <span className="block text-volt">till {formatTime(status.day.end)}</span>
            </p>
            <Forecast weather={weather} date={status.day.date} />
          </>
        )}

        {status.kind === "today" && (
          <>
            <StatusLine tone="go" label="Riding today" pulse />
            <BigDate day={status.day} />
            <Forecast weather={weather} date={status.day.date} />
          </>
        )}

        {status.kind === "cancelled" && (
          <>
            <StatusLine tone="stop" label="Practice cancelled today" />
            <p className="display text-5xl text-white">No riding today</p>
            {status.day.cancelReason && <p className="text-white/75">{status.day.cancelReason}</p>}
            {status.next && (
              <p className="border-t border-white/10 pt-4 text-sm text-white/70">
                Next ride day:{" "}
                <span className="font-semibold text-white">
                  {formatDay(status.next.date, "long")}, {formatTimeRange(status.next.start, status.next.end)}
                </span>
              </p>
            )}
          </>
        )}

        {status.kind === "upcoming" && (
          <>
            <StatusLine tone="wait" label="Next ride day" />
            <BigDate day={status.day} />
            <Forecast weather={weather} date={status.day.date} />
            {status.following.length > 0 && (
              <ul className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                {status.following.map((d) => (
                  <li key={d.id} className="rounded-sm border border-white/12 px-2.5 py-1 text-xs text-white/70">
                    {formatDay(d.date)} · {formatTimeRange(d.start, d.end)}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {status.kind === "off-season" && (
          <>
            <StatusLine tone="wait" label="Off season" />
            <p className="display text-5xl text-white">
              Season&apos;s wrapped.
              <span className="block text-volt">Back in spring.</span>
            </p>
            <p className="text-sm text-white/70">
              New dates post on the schedule
              {facebook ? (
                <>
                  {" "}and{" "}
                  <a href={facebook} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-white">
                    Facebook
                  </a>
                </>
              ) : null}{" "}
              first.
            </p>
          </>
        )}

        <Link
          href="/schedule"
          className="eyebrow group flex items-center justify-between border-t border-white/10 pt-4 text-white/80 transition-colors hover:text-volt"
        >
          Full schedule
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
