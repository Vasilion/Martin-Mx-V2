import { NextResponse } from "next/server";
import { getStore } from "@/lib/registrations/store";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe's "back" link. Expires the open session right away so the held spot frees up
 * now instead of in 30 minutes (the expiry webhook does the actual release), then
 * returns the rider to the form on the same day.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const rid = url.searchParams.get("rid") ?? "";
  const back = new URL("/register", url.origin);

  const reg = /^[0-9a-f-]{36}$/.test(rid) ? await getStore().get(rid) : null;
  if (reg) {
    back.searchParams.set("day", reg.date);
    if (reg.status === "pending" && reg.stripeSessionId) {
      try {
        await getStripe().checkout.sessions.expire(reg.stripeSessionId);
        await getStore().release(reg.id);
      } catch {
        // Expire fails if the session already completed or expired. Releasing then could
        // void a paid registration, so leave it to the webhook.
      }
    }
  }
  return NextResponse.redirect(back, 303);
}
