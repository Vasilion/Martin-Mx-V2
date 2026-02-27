import { promises as fs } from "node:fs";
import path from "node:path";
import {
  contactContentSchema,
  gallerySchema,
  homeContentSchema,
  pricingSchema,
  scheduleEventsSchema,
  sponsorsSchema,
  siteSettingsSchema,
  trackInfoSchema,
} from "@/lib/content/schemas";

const contentRoot = path.join(process.cwd(), "content");

async function readJsonFile(relativePath: string): Promise<unknown> {
  const fullPath = path.join(contentRoot, relativePath);
  const value = await fs.readFile(fullPath, "utf8");
  return JSON.parse(value);
}

export async function getSiteSettings() {
  return siteSettingsSchema.parse(await readJsonFile("site/settings.json"));
}

export async function getHomeContent() {
  return homeContentSchema.parse(await readJsonFile("site/home.json"));
}

export async function getScheduleEvents() {
  const value = scheduleEventsSchema.parse(await readJsonFile("schedule/events.json"));
  return value.events;
}

export async function getPricingConfig() {
  return pricingSchema.parse(await readJsonFile("forms/pricing.json"));
}

export async function getTrackInfoContent() {
  return trackInfoSchema.parse(await readJsonFile("site/track-info.json"));
}

export async function getContactContent() {
  return contactContentSchema.parse(await readJsonFile("site/contact.json"));
}

export async function getSponsors() {
  const value = sponsorsSchema.parse(await readJsonFile("sponsors/sponsors.json"));
  return value.sponsors;
}

export async function getGalleryItems() {
  const value = gallerySchema.parse(await readJsonFile("gallery/gallery.json"));
  return value.items;
}
