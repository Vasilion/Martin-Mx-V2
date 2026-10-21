import { NextResponse } from "next/server";
import { practiceRegistrationSchema } from "@/lib/register/schema";
import { getPractice, getSchedule } from "@/lib/park/live";
import { isRegistrable, priceFor } from "@/lib/registrations/availability";
import { getStore, SoldOutError, type Registration } from "@/lib/registrations/store";
import { getStripe, siteOrigin } from "@/lib/stripe";
import { formatDay, formatTimeRange } from "@/lib/park/format";

export const runtime = "nodejs";

/** Checkout sessions (and therefore spot holds) last Stripe's minimum: 30 minutes. */
const HOLD_SECONDS = 30 * 60 + 60;

export async function POST(req: Request) {
  const parsed = practiceRegistrationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Some details are missing or invalid. Check the form and try again." }, { status: 400 });
  }
  const input = parsed.data;

  const [schedule, practice] = await Promise.all([getSchedule(), getPractice()]);
  const day = schedule.find((d) => d.date === input.date);
  if (!day || !isRegistrable(day)) {
    return NextResponse.json({ error: "Registration for that day is closed. Pick another day." }, { status: 409 });
  }
  const priced = priceFor(practice, input.classId);
  if (!priced) return NextResponse.json({ error: "Pick a valid class." }, { status: 400 });

  // Prices always come from the server, never the form.
  const { waiverAck: _ack, ...rider } = input;
  const reg: Registration = {
    ...rider,
    id: crypto.randomUUID(),
    status: "pending",
    amount: priced.amount,
    createdAt: new Date().toISOString(),
  };

  const store = getStore();
  try {
    await store.reserve(reg, practice.defaultCapacity);
  } catch (err) {
    if (err instanceof SoldOutError) {
      return NextResponse.json({ error: `${priced.cls.label} is full for ${formatDay(day.date)}. Try another class or day.` }, { status: 409 });
    }
    throw err;
  }

  const origin = siteOrigin(req);
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: reg.email,
      client_reference_id: reg.id,
      expires_at: Math.floor(Date.now() / 1000) + HOLD_SECONDS,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(reg.amount * 100),
            product_data: {
              name: `Practice day: ${priced.cls.label} (${priced.cls.track === "main" ? "Main" : "Junior"} track)`,
              description: `${formatDay(day.date, "long")}, ${formatTimeRange(day.start, day.end)} · ${reg.firstName} ${reg.lastName} #${reg.riderNumber}`,
            },
          },
        },
      ],
      metadata: { kind: "practice", registrationId: reg.id },
      payment_intent_data: {
        description: `Martin MX practice ${day.date} · ${priced.cls.label} · ${reg.firstName} ${reg.lastName}`,
        metadata: { kind: "practice", registrationId: reg.id },
      },
      success_url: `${origin}/register/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/api/checkout/cancel?rid=${reg.id}`,
    });
    await store.attachSession(reg.id, session.id);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    await store.release(reg.id);
    console.error("practice checkout failed", err);
    return NextResponse.json({ error: "Couldn't start checkout. Please try again in a moment." }, { status: 502 });
  }
}
