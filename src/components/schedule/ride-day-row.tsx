import Link from "next/link";
import { ArrowRight, Ban, CloudRain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RideDay } from "@/lib/park/live";
import type { DayForecast } from "@/lib/park/weather";
import { describeWeather } from "@/lib/park/weather";
import { formatTimeRange, monthDay, weekdayOf } from "@/lib/park/format";

export function RideDayRow({
  day,
  isToday,
  forecast,
  registrationEnabled,
}: {
  day: RideDay;
  isToday: boolean;
  forecast?: DayForecast;
  /** Site-wide practice registration switch. */
  registrationEnabled: boolean;
}) {
  const canRegister = registrationEnabled && day.registrationOpen && !day.cancelled;
  const { month, day: dom } = monthDay(day.date);
  return (
    <li
      className={cn(
        "group grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-3 border-b border-white/10 py-6 md:grid-cols-[7rem_1fr_auto_auto] md:gap-x-10",
        day.cancelled && "opacity-80",
      )}
    >
      <div className="flex w-20 flex-col items-start md:w-auto">
        <span className="eyebrow text-white/50">{month}</span>
        <span className={cn("display text-6xl text-white md:text-7xl", day.cancelled && "text-white/40 line-through decoration-danger decoration-4")}>
          {dom}
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {isToday && !day.cancelled && (
            <span className="eyebrow rounded-sm bg-volt px-2 py-1 text-[0.65rem] text-ink">Today</span>
          )}
          {day.cancelled && (
            <span className="eyebrow flex items-center gap-1.5 rounded-sm bg-danger/15 px-2 py-1 text-[0.65rem] text-danger">
              <Ban className="size-3" aria-hidden /> Cancelled
            </span>
          )}
          {canRegister && (
            <span className="eyebrow rounded-sm border border-volt/50 px-2 py-1 text-[0.65rem] text-volt">Registration open</span>
          )}
        </div>
        <p className="mt-2 font-display text-[clamp(1.5rem,8vw,1.875rem)] font-bold uppercase italic text-white md:text-4xl">
          {weekdayOf(day.date, "long")}
        </p>
        <p className="mt-1 text-white/65">
          {day.title} · {formatTimeRange(day.start, day.end)}
        </p>
        {day.cancelled && day.cancelReason && <p className="mt-2 text-sm text-danger">{day.cancelReason}</p>}
      </div>

      {forecast && !day.cancelled ? (
        <div className="col-span-2 flex items-center gap-4 text-sm text-white/65 md:col-span-1 md:block md:text-right">
          <p className="font-semibold text-white">
            {forecast.highF}° / {forecast.lowF}°
          </p>
          <p>{describeWeather(forecast.code)}</p>
          <p className="flex items-center gap-1 md:justify-end">
            <CloudRain className="size-3.5" aria-hidden /> {forecast.rainChance}%
          </p>
        </div>
      ) : (
        <div className="hidden md:block" />
      )}

      {canRegister ? (
        <Link
          href={`/register?day=${day.date}`}
          className="eyebrow col-span-2 flex items-center justify-center gap-2 rounded-sm bg-volt px-5 py-3.5 text-ink transition hover:bg-white md:col-span-1"
        >
          Register <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <div className="hidden md:block" />
      )}
    </li>
  );
}
