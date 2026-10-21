import { z } from "zod";

/** What a rider submits to start a practice-day checkout. Shared by the form and the API. */
export const practiceRegistrationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a ride day"),
  classId: z.string().min(1, "Pick a class"),
  firstName: z.string().trim().min(1, "Required").max(60),
  lastName: z.string().trim().min(1, "Required").max(60),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a phone number").max(20),
  riderNumber: z.string().trim().min(1, "Required").max(5),
  bikeSize: z.coerce.number().int().min(50, "Enter cc, e.g. 250").max(1000, "Enter cc, e.g. 250"),
  ageGroup: z.enum(["adult", "minor"], { message: "Pick one" }),
  waiverAck: z.literal(true, { message: "Required to register" }),
});

export type PracticeRegistration = z.infer<typeof practiceRegistrationSchema>;
