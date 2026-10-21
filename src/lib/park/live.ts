import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
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

/**
 * Storage: DynamoDB when MARTIN_TABLE is set (owner dashboard edits land there),
 * otherwise the JSON seed in content/live/ (read-only; local dev without AWS).
 * `scripts/seed-live-data.mjs` copies the JSON seed into a fresh table.
 *
 *   CONFIG   / practice | membership | sponsors   documents
 *   SCHEDULE / <YYYY-MM-DD>                       one ride day per item
 */
const liveRoot = path.join(process.cwd(), "content", "live");
const table = () => process.env.MARTIN_TABLE;

let db: DynamoDBDocumentClient | null = null;
function client() {
  db ??= DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" }), {
    marshallOptions: { removeUndefinedValues: true },
  });
  return db;
}

async function readSeed<T>(file: string, schema: z.ZodType<T>): Promise<T> {
  const raw = await fs.readFile(path.join(liveRoot, file), "utf8");
  return schema.parse(JSON.parse(raw));
}

const sponsorsDoc = z.object({ sponsors: z.array(sponsorSchema) });
const docs = {
  practice: { schema: practiceSchema, seed: "practice.json" },
  membership: { schema: membershipSchema, seed: "membership.json" },
  sponsors: { schema: sponsorsDoc, seed: "sponsors.json" },
} as const;
type DocName = keyof typeof docs;
type DocValue<K extends DocName> = z.infer<(typeof docs)[K]["schema"]>;

async function getDoc<K extends DocName>(name: K): Promise<DocValue<K>> {
  const { schema, seed } = docs[name];
  const t = table();
  if (t) {
    const res = await client().send(new GetCommand({ TableName: t, Key: { pk: "CONFIG", sk: name } }));
    if (res.Item) return schema.parse(res.Item.value) as DocValue<K>;
  }
  return readSeed(seed, schema as unknown as z.ZodType<DocValue<K>>);
}

export async function putDoc<K extends DocName>(name: K, value: DocValue<K>) {
  const t = table();
  if (!t) throw new Error("Editing needs MARTIN_TABLE (DynamoDB).");
  const parsed = docs[name].schema.parse(value);
  await client().send(
    new PutCommand({ TableName: t, Item: { pk: "CONFIG", sk: name, value: parsed, updatedAt: new Date().toISOString() } }),
  );
}

export async function getSchedule(): Promise<RideDay[]> {
  const t = table();
  let days: RideDay[];
  if (t) {
    const res = await client().send(
      new QueryCommand({ TableName: t, KeyConditionExpression: "pk = :p", ExpressionAttributeValues: { ":p": "SCHEDULE" } }),
    );
    days = (res.Items ?? []).map((i) => rideDaySchema.parse(i.day));
  } else {
    days = (await readSeed("schedule.json", z.object({ events: z.array(rideDaySchema) }))).events;
  }
  return days.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
}

export async function putRideDay(day: RideDay) {
  const t = table();
  if (!t) throw new Error("Editing needs MARTIN_TABLE (DynamoDB).");
  const parsed = rideDaySchema.parse(day);
  await client().send(new PutCommand({ TableName: t, Item: { pk: "SCHEDULE", sk: parsed.date, day: parsed } }));
}

export async function deleteRideDay(date: string) {
  const t = table();
  if (!t) throw new Error("Editing needs MARTIN_TABLE (DynamoDB).");
  await client().send(new DeleteCommand({ TableName: t, Key: { pk: "SCHEDULE", sk: date } }));
}

export function getPractice() {
  return getDoc("practice");
}

export function getMembership() {
  return getDoc("membership");
}

/** All sponsors, including inactive (dashboard). */
export async function getAllSponsors(): Promise<Sponsor[]> {
  return (await getDoc("sponsors")).sponsors;
}

export async function getSponsors(): Promise<Sponsor[]> {
  return (await getAllSponsors()).filter((s) => s.active);
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
