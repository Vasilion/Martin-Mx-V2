import "server-only";
import { z } from "zod";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import {
  concessions,
  gearRequirements,
  minorPolicy,
  park,
  specialEventPolicies,
  trackRules,
  tracks as defaultTracks,
  waivers as defaultWaivers,
} from "@/lib/park/facts";

/**
 * Owner-editable site content. Each document lives at CONFIG/<name> in DynamoDB and
 * falls back to the defaults below (today's copy from facts.ts) until an owner edits it,
 * so the site never changes on its own.
 */

const text = (max: number) => z.string().trim().max(max);
const req = (max: number) => z.string().trim().min(1, "Required").max(max);
const url = z.string().trim().url("Enter a full link starting with https://").max(500);
const optUrl = z.union([z.literal(""), url]);
const block = z.object({ title: req(80), body: req(600) });
const image = z.string().trim().min(1).max(500);

export const contentSchemas = {
  site: z.object({
    phone: req(30),
    email: z.string().trim().email("Enter a valid email"),
    street: req(80),
    city: req(40),
    region: req(20),
    postalCode: req(12),
    directionsNote: text(120),
    facebook: optUrl,
    instagram: optUrl,
    storeUrl: optUrl,
  }),
  home: z.object({
    heroEyebrow: text(80),
    heroLine1: req(30),
    heroLine2: req(30),
    heroImage: image,
    ticker: z.array(req(30)).max(8),
    tracksHeading: req(40),
    tracksAccent: text(40),
    flyoverEyebrow: text(60),
    flyoverHeading: req(40),
    flyoverBody: text(200),
    galleryHeading: req(40),
    visitHeading: req(30),
    visitAccent: text(30),
    visitNote: text(240),
  }),
  tracks: z.object({
    main: z.object({
      name: req(40),
      tagline: text(100),
      image,
      imageAlt: text(140),
      stats: z.array(z.object({ value: req(8), label: req(24) })).length(3),
      body: z.array(req(800)).min(1).max(4),
    }),
    junior: z.object({
      name: req(40),
      tagline: text(100),
      image,
      imageAlt: text(140),
      stats: z.array(z.object({ value: req(8), label: req(24) })).length(3),
      body: z.array(req(800)).min(1).max(4),
    }),
  }),
  trackInfo: z.object({
    intro: text(400),
    gear: z.array(req(60)).max(15),
    gearNote: text(300),
    minorIntro: text(300),
    minorRules: z.array(req(300)).max(10),
    noParentTitle: req(60),
    noParentBody: req(500),
    rules: z.array(block).max(30),
    concessions: text(300),
    specialEvents: z.array(block).max(10),
  }),
  waivers: z.object({
    items: z.array(z.object({ id: req(40), label: req(40), note: text(40), href: image })).max(8),
  }),
  announcement: z.object({
    active: z.boolean(),
    tone: z.enum(["info", "warning"]),
    message: text(160),
    linkLabel: text(30),
    linkHref: z.union([z.literal(""), z.string().trim().max(500)]),
  }),
  hiring: z.object({
    open: z.boolean(),
    intro: text(500),
    positions: z.array(req(40)).min(1).max(10),
    availability: z.array(req(40)).min(1).max(10),
  }),
  contact: z.object({
    intro: text(300),
  }),
  gallery: z.object({
    items: z
      .array(
        z.object({
          id: req(60),
          src: image,
          alt: text(160),
          width: z.number().int().positive(),
          height: z.number().int().positive(),
          featured: z.boolean(),
        }),
      )
      .max(300),
  }),
} as const;

export type ContentName = keyof typeof contentSchemas;
export type Content<K extends ContentName> = z.infer<(typeof contentSchemas)[K]>;

const toTrack = (t: (typeof defaultTracks)["main"]) => ({
  name: t.name,
  tagline: t.tagline,
  image: t.image,
  imageAlt: t.imageAlt,
  stats: t.stats.map((s) => ({ ...s })),
  body: [...t.body],
});

const defaults: { [K in ContentName]: () => Content<K> } = {
  site: () => ({
    phone: park.phone.display,
    email: park.email,
    street: park.address.street,
    city: park.address.city,
    region: park.address.region,
    postalCode: park.address.postalCode,
    directionsNote: park.address.directionsNote,
    facebook: park.social.facebook,
    instagram: park.social.instagram,
    storeUrl: park.storeUrl,
  }),
  home: () => ({
    heroEyebrow: "Martin, Michigan · Two tracks · Off US-131",
    heroLine1: "This is",
    heroLine2: "motocross.",
    heroImage: "/photos/hero-bw.jpg",
    ticker: ["Two tracks", "Junior track", "Martin, MI", "Off US-131"],
    tracksHeading: "Two tracks.",
    tracksAccent: "Every rider.",
    flyoverEyebrow: "Know it before you unload",
    flyoverHeading: "Walk the track.",
    flyoverBody: "Spin the 3D model, study the lines, then come ride it.",
    galleryHeading: "Roost & repeat.",
    visitHeading: "Just off",
    visitAccent: "US-131.",
    visitNote: "Gas station and Subway half a mile down the road. Early arrival welcome; the track opens on time.",
  }),
  tracks: () => ({ main: toTrack(defaultTracks.main), junior: toTrack(defaultTracks.junior) }),
  trackInfo: () => ({
    intro:
      "Everything you need for ride day: hours, pricing, the gear you must have, the rules for young riders, and the waivers to print before you leave the house.",
    gear: [...gearRequirements],
    gearNote:
      "Show up without these and you'll be asked to leave the track until you have them. Making sure you're geared up is on you.",
    minorIntro: minorPolicy.intro,
    minorRules: [...minorPolicy.rules],
    noParentTitle: minorPolicy.noParent.title,
    noParentBody: minorPolicy.noParent.body,
    rules: trackRules.map((r) => ({ ...r })),
    concessions: concessions.body,
    specialEvents: specialEventPolicies.map((r) => ({ ...r })),
  }),
  waivers: () => ({ items: defaultWaivers.map((w) => ({ id: w.id, label: w.label, note: w.note, href: w.href })) }),
  announcement: () => ({ active: false, tone: "info", message: "", linkLabel: "", linkHref: "" }),
  hiring: () => ({
    open: true,
    intro: "Love dirt bikes and want to be part of race day? We're looking for dependable people to help run the track.",
    positions: ["Flagger", "Rider Registration"],
    availability: ["Wednesdays (3–8pm)", "Saturdays (9am–3pm)", "Sundays (10am–4pm)", "Weekends", "Any"],
  }),
  contact: () => ({
    intro: "Questions about practice, memberships, events or sponsoring? Send a message and we'll get back to you.",
  }),
  gallery: () => ({
    items: [
      ["/photos/roost-495.jpg", "Young rider #495 roosting through deep sand", 1600, 1200],
      ["/photos/roost-yellow.jpg", "Rider on a yellow bike blasting a roost in a corner", 1400, 934],
      ["/media/gallery/strapi-gallery-9.jpg", "Rider whipping over a jump against the sky", 1000, 1000],
      ["/photos/roost-green.jpg", "Rider #10 on a green bike throwing dirt off a berm", 1400, 933],
      ["/media/gallery/strapi-gallery-4.jpg", "Rider airborne over the tree line", 1000, 1000],
      ["/photos/rider-red.jpg", "Rider leaning a red bike through a flat corner", 1600, 1200],
    ].map(([src, alt, width, height], i) => ({ id: `seed-${i}`, src: src as string, alt: alt as string, width: width as number, height: height as number, featured: true })),
  }),
};

let db: DynamoDBDocumentClient | null = null;
function client() {
  db ??= DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" }), {
    marshallOptions: { removeUndefinedValues: true },
  });
  return db;
}

export async function getContent<K extends ContentName>(name: K): Promise<Content<K>> {
  const table = process.env.MARTIN_TABLE;
  if (table) {
    const res = await client().send(new GetCommand({ TableName: table, Key: { pk: "CONFIG", sk: name } }));
    if (res.Item) {
      const parsed = contentSchemas[name].safeParse(res.Item.value);
      if (parsed.success) return parsed.data as Content<K>;
      console.error(`content ${name} failed validation; using defaults`, parsed.error.issues[0]);
    }
  }
  return defaults[name]();
}

export async function putContent<K extends ContentName>(name: K, value: unknown) {
  const table = process.env.MARTIN_TABLE;
  if (!table) throw new Error("Editing needs MARTIN_TABLE (DynamoDB).");
  const parsed = contentSchemas[name].parse(value);
  await client().send(new PutCommand({ TableName: table, Item: { pk: "CONFIG", sk: name, value: parsed, updatedAt: new Date().toISOString() } }));
  return parsed as Content<K>;
}

/** Site contact info in the shapes components want. */
export async function getSite() {
  const s = await getContent("site");
  const full = `${s.street}, ${s.city}, ${s.region} ${s.postalCode}`;
  const digits = s.phone.replace(/[^\d+]/g, "");
  return {
    ...s,
    addressFull: full,
    phoneHref: `tel:${digits.startsWith("+") ? digits : `+1${digits}`}`,
    mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(full)}`,
    mapsEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(full)}&output=embed`,
  };
}
export type SiteInfo = Awaited<ReturnType<typeof getSite>>;
