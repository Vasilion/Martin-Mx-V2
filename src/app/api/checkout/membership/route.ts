import { NextResponse } from "next/server";
import { getMembership } from "@/lib/park/live";
import { getStripe, siteOrigin } from "@/lib/stripe";
import { parkNow } from "@/lib/park/live";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const membership = await getMembership();
  if (!membership.open) {
    return NextResponse.json({ error: "Memberships aren't on sale right now." }, { status: 409 });
  }
  const year = Number(parkNow().date.slice(0, 4));
  const origin = siteOrigin(req);

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(membership.price * 100),
            product_data: {
              name: `Martin MX unlimited membership (${year})`,
              description: "Unlimited track riding during open hours. Membership card mailed to you.",
            },
          },
        },
      ],
      // The card is mailed, so collect where to send it, plus a phone for the owners.
      shipping_address_collection: { allowed_countries: ["US"] },
      phone_number_collection: { enabled: true },
      metadata: { kind: "membership", year: String(year) },
      payment_intent_data: { description: `Martin MX unlimited membership ${year}`, metadata: { kind: "membership", year: String(year) } },
      success_url: `${origin}/register/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/register?tab=membership`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("membership checkout failed", err);
    return NextResponse.json({ error: "Couldn't start checkout. Please try again in a moment." }, { status: 502 });
  }
}
