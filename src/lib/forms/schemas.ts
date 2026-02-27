import { z } from "zod";

const requiredString = z.string().trim().min(1);

export const practiceSignupSchema = z.object({
  riderFullName: requiredString,
  riderEmail: z.string().email(),
  riderPhone: requiredString,
  riderAge: requiredString,
  bikeClass: requiredString,
  bikeSize: requiredString,
  selectedDate: requiredString,
  selectedSessionOrTimeWindow: requiredString,
  trackType: requiredString,
  priceShownAtCheckout: z.number().nonnegative(),
  paymentStatus: requiredString,
});

export const membershipSignupSchema = z.object({
  riderFullName: requiredString,
  riderEmail: z.string().email(),
  riderPhone: requiredString,
  riderAge: requiredString,
  bikeClass: requiredString,
  bikeSize: requiredString,
  membershipType: requiredString,
  membershipPrice: z.number().nonnegative(),
  paymentStatus: requiredString,
});

export const contactSchema = z.object({
  fullName: requiredString,
  email: z.string().email(),
  phone: requiredString,
  subject: requiredString,
  message: requiredString,
});

export const hiringSchema = z.object({
  fullName: requiredString,
  email: z.string().email(),
  phone: requiredString,
  preferredPosition: requiredString,
  availability: requiredString,
  experienceSummary: requiredString,
});

export const dailySignupSchema = z.object({
  riderFullName: requiredString,
  riderEmail: z.string().email(),
  riderPhone: requiredString,
  riderAge: requiredString,
  bikeClass: requiredString,
  bikeSize: requiredString,
  selectedDate: requiredString,
  waiverAcknowledgement: z.boolean(),
});

export const formSchemas = {
  practice: practiceSignupSchema,
  membership: membershipSignupSchema,
  contact: contactSchema,
  hiring: hiringSchema,
  daily: dailySignupSchema,
} as const;

export type FormType = keyof typeof formSchemas;
