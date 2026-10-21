import { NextResponse } from "next/server";
import { z } from "zod";
import { getContent } from "@/lib/park/content";
import { fieldErrors, looksLikeBot, submitToInbox } from "@/lib/inbox/submit";

export const runtime = "nodejs";

const yesNo = z.enum(["Yes", "No"], { message: "Pick yes or no" });
const applicationSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(60),
  lastName: z.string().trim().min(1, "Required").max(60),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a phone number").max(20),
  age: z.coerce.number({ message: "Enter your age" }).int().min(16, "You must be 16 or older").max(99),
  city: z.string().trim().min(1, "Required").max(60),
  position: z.string().trim().min(1, "Pick a position").max(40),
  availability: z.string().trim().min(1, "Pick your availability").max(40),
  customerService: yesNo,
  industry: yesNo,
  rides: yesNo,
  procedures: z.enum(["Very familiar", "Somewhat familiar", "Not familiar"], { message: "Pick one" }),
  startWhen: z.string().trim().min(1, "Required").max(200),
  extra: z.string().trim().max(2000).optional().default(""),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  if (looksLikeBot(body)) return NextResponse.json({ ok: true }); // don't tell bots they were caught
  const hiring = await getContent("hiring");
  if (!hiring.open) return NextResponse.json({ error: "We're not taking applications right now." }, { status: 409 });
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the highlighted fields.", fields: fieldErrors(parsed.error.issues) }, { status: 400 });
  }
  const v = parsed.data;
  await submitToInbox({
    kind: "application",
    name: `${v.firstName} ${v.lastName}`,
    email: v.email,
    phone: v.phone,
    fields: [
      { label: "Position", value: v.position },
      { label: "Availability", value: v.availability },
      { label: "Age", value: String(v.age) },
      { label: "City", value: v.city },
      { label: "Customer service experience", value: v.customerService },
      { label: "Familiar with the motocross industry", value: v.industry },
      { label: "Rides motocross", value: v.rides },
      { label: "Familiar with track operating procedures", value: v.procedures },
      { label: "Can start training", value: v.startWhen },
      { label: "Anything else", value: v.extra },
    ],
  });
  return NextResponse.json({ ok: true });
}
