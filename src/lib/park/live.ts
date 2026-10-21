import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { park } from "@/lib/park/facts";

/**
 * Owner-managed data: schedule, practice pricing/classes/hours, membership,
 * sponsors. Seeded from JSON in `content/live/` today; the owner dashboard
 * swaps these readers for DynamoDB without touching the pages.
 */

const time = z.string().regex(/^\d{2}:\d{2}$/);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const rideDaySchema = z.object({
  id: z.string().min(1),
  date: isoDate,
  start: time,
  end: time,
  title: z.string().min(1),
  cancelled: z.boolean(),
  cancelReason: z.string(),
  registrationOpen: z.boolean(),
});

export const practiceSchema = z.object({
  prices: z.object({
    main: z.number().nonnegative(),
    junior: z.number().nonnegative(),
    spectator: z.number().nonnegative(),
  }),
  classes: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        track: z.enum(["main", "junior"]),
      }),
    )
    .min(1),
  defaultCapacity: z.number().int().positive(),
  hours: z.array(z.object({ day: z.string().min(1), open: time, close: time })),
  hoursNote: z.string(),
});

export const membershipSchema = z.object({
  open: z.boolean(),
  price: z.number().nonnegative(),
  perks: z.array(z.string().min(1)),
});

export const sponsorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  href: z.string().url(),
  logo: z.string().min(1),
  title: z.boolean(),
  active: z.boolean(),
});

export type RideDay = z.infer<typeof rideDaySchema>;
export type Practice = z.infer<typeof practiceSchema>;
export type Membership = z.infer<typeof membershipSchema>;
export type Sponsor = z.infer<typeof sponsorSchema>;

const liveRoot = path.join(process.cwd(), "content", "live");

async function readLive<T>(file: string, schema: z.ZodType<T>): Promise<T> {
  const raw = await fs.readFile(path.join(liveRoot, file), "utf8");
  return schema.parse(JSON.parse(raw));
}

export async function getSchedule(): Promise<RideDay[]> {
  const { events } = await readLive("schedule.json", z.object({ events: z.array(rideDaySchema) }));
  return [...events].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
}

export function getPractice() {
  return readLive("practice.json", practiceSchema);
}

export function getMembership() {
  return readLive("membership.json", membershipSchema);
}

export async function getSponsors(): Promise<Sponsor[]> {
  const { sponsors } = await readLive("sponsors.json", z.object({ sponsors: z.array(sponsorSchema) }));
  return sponsors.filter((s) => s.active);
}

/** Wall-clock date + time at the park, regardless of server time zone. */
export function parkNow(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: park.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

export type TrackStatus =
  | { kind: "riding-now"; day: RideDay }
  | { kind: "cancelled"; day: RideDay; next: RideDay | null }
  | { kind: "today"; day: RideDay }
  | { kind: "upcoming"; day: RideDay; following: RideDay[] }
  | { kind: "off-season" };

/**
 * The one answer every rider wants: can I ride, and when?
 * Today's ride day wins (riding now / later today / cancelled), otherwise the next scheduled day.
 */
export function resolveTrackStatus(schedule: RideDay[], now = new Date()): TrackStatus {
  const { date, time } = parkNow(now);
  const today = schedule.find((d) => d.date === date);
  const future = schedule.filter((d) => !d.cancelled && (d.date > date || (d.date === date && d.end > time)));
  const nextAfterToday = future.find((d) => d.date > date) ?? null;

  if (today?.cancelled) return { kind: "cancelled", day: today, next: nextAfterToday };
  if (today && today.end > time) {
    return today.start <= time ? { kind: "riding-now", day: today } : { kind: "today", day: today };
  }
  const [next, ...rest] = future.filter((d) => d.date > date);
  if (next) return { kind: "upcoming", day: next, following: rest.slice(0, 3) };
  return { kind: "off-season" };
}
