import { z } from "zod";

export const siteSettingsSchema = z.object({
  siteName: z.string().min(1),
  tagline: z.string().min(1),
  primaryColor: z.string().min(1),
  secondaryColor: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  address: z.string().min(1),
  storeLink: z.string().url(),
  practiceOpen: z.boolean(),
  membershipOpen: z.boolean(),
  practiceCancelled: z.boolean(),
  practiceCancelReason: z.string(),
});

export const homeContentSchema = z.object({
  heroTitle: z.string().min(1),
  heroDescription: z.string().min(1),
  heroCtaLabel: z.string().min(1),
  heroCtaHref: z.string().min(1),
  trackMapTitle: z.string().min(1),
  trackMapDescription: z.string().min(1),
  trackMapEmbedUrl: z.string().url(),
  videoTitle: z.string().min(1),
  videoDescription: z.string().min(1),
  trackVideoUrl: z.string().url(),
  features: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  ),
});

export const scheduleEventSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  title: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  isCancelled: z.boolean(),
});

export const scheduleEventsSchema = z.object({
  events: z.array(scheduleEventSchema),
});

export const pricingSchema = z.object({
  practicePrice: z.number().nonnegative(),
  membershipPrice: z.number().nonnegative(),
  bikeClasses: z.array(z.string().min(1)).min(1),
  bikeSizes: z.array(z.string().min(1)).min(1),
});

export const trackInfoSchema = z.object({
  hoursText: z.string().min(1),
  pricingText: z.string().min(1),
  requirements: z.array(z.string().min(1)).min(1),
  waiverLinks: z.array(
    z.object({
      label: z.string().min(1),
      href: z.string().url(),
    }),
  ),
  rules: z.array(z.string().min(1)).min(1),
});

export const contactContentSchema = z.object({
  headline: z.string().min(1),
  description: z.string().min(1),
  googleMapsHref: z.string().url(),
  facebookHref: z.string().url(),
  instagramHref: z.string().url(),
  twitterHref: z.string().url(),
});

export const sponsorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  href: z.string().url(),
  logo: z.string().min(1),
  isTitleSponsor: z.boolean(),
  isActive: z.boolean(),
});

export const sponsorsSchema = z.object({
  sponsors: z.array(sponsorSchema),
});

export const galleryItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  image: z.string().min(1),
  alt: z.string().min(1),
  isFeatured: z.boolean(),
});

export const gallerySchema = z.object({
  items: z.array(galleryItemSchema),
});

export const tracksContentSchema = z.object({
  mainTrackTitle: z.string().min(1),
  mainTrackDescription: z.array(z.string().min(1)).min(1),
  juniorTrackTitle: z.string().min(1),
  juniorTrackDescription: z.array(z.string().min(1)).min(1),
});

export const successContentSchema = z.object({
  practiceTitle: z.string().min(1),
  practiceDescription: z.string().min(1),
  membershipTitle: z.string().min(1),
  membershipDescription: z.string().min(1),
});

export const operationsContentSchema = z.object({
  practiceCashOnly: z.boolean(),
  practiceStatusLabel: z.string().min(1),
  practiceCtaLabel: z.string().min(1),
  membershipStatusLabel: z.string().min(1),
  membershipCtaLabel: z.string().min(1),
  practiceSessions: z.array(
    z.object({
      label: z.string().min(1),
      date: z.string().min(1),
      startTime: z.string().min(1),
      endTime: z.string().min(1),
    }),
  ),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type HomeContent = z.infer<typeof homeContentSchema>;
export type ScheduleEvent = z.infer<typeof scheduleEventSchema>;
export type PricingConfig = z.infer<typeof pricingSchema>;
export type TrackInfoContent = z.infer<typeof trackInfoSchema>;
export type ContactContent = z.infer<typeof contactContentSchema>;
export type Sponsor = z.infer<typeof sponsorSchema>;
export type GalleryItem = z.infer<typeof galleryItemSchema>;
export type TracksContent = z.infer<typeof tracksContentSchema>;
export type SuccessContent = z.infer<typeof successContentSchema>;
export type OperationsContent = z.infer<typeof operationsContentSchema>;
