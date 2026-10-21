import { NextResponse } from "next/server";
import { z } from "zod";
import { fieldErrors, looksLikeBot, submitToInbox } from "@/lib/inbox/submit";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().max(20).optional().default(""),
  topic: z.string().trim().max(40).optional().default("General"),
  message: z.string().trim().min(5, "Write a short message").max(3000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  if (looksLikeBot(body)) return NextResponse.json({ ok: true });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the highlighted fields.", fields: fieldErrors(parsed.error.issues) }, { status: 400 });
  }
  const v = parsed.data;
  await submitToInbox({
    kind: "message",
    name: v.name,
    email: v.email,
    phone: v.phone || undefined,
    fields: [
      { label: "Topic", value: v.topic },
      { label: "Message", value: v.message },
    ],
  });
  return NextResponse.json({ ok: true });
}
