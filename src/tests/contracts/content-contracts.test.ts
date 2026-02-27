import { describe, expect, it } from "vitest";
import {
  getContactContent,
  getGalleryItems,
  getHomeContent,
  getOperationsContent,
  getPricingConfig,
  getScheduleEvents,
  getSiteSettings,
  getSuccessContent,
  getTracksContent,
  getSponsors,
  getTrackInfoContent,
} from "@/lib/content/loader";

describe("content contracts", () => {
  it("parses site settings", async () => {
    const value = await getSiteSettings();
    expect(value.siteName.length).toBeGreaterThan(0);
  });

  it("parses home content and features", async () => {
    const value = await getHomeContent();
    expect(value.features.length).toBeGreaterThan(0);
  });

  it("parses schedule events", async () => {
    const value = await getScheduleEvents();
    expect(value.length).toBeGreaterThan(0);
  });

  it("parses pricing config", async () => {
    const value = await getPricingConfig();
    expect(value.bikeClasses.length).toBeGreaterThan(0);
  });

  it("parses track info content", async () => {
    const value = await getTrackInfoContent();
    expect(value.requirements.length).toBeGreaterThan(0);
  });

  it("parses tracks content", async () => {
    const value = await getTracksContent();
    expect(value.mainTrackDescription.length).toBeGreaterThan(0);
  });

  it("parses contact content", async () => {
    const value = await getContactContent();
    expect(value.googleMapsHref.startsWith("https://")).toBe(true);
  });

  it("parses sponsors content", async () => {
    const value = await getSponsors();
    expect(value.length).toBeGreaterThan(0);
  });

  it("parses gallery content", async () => {
    const value = await getGalleryItems();
    expect(value.length).toBeGreaterThan(0);
  });

  it("parses success page content", async () => {
    const value = await getSuccessContent();
    expect(value.practiceTitle.length).toBeGreaterThan(0);
  });

  it("parses operations content", async () => {
    const value = await getOperationsContent();
    expect(value.practiceSessions.length).toBeGreaterThan(0);
  });
});
