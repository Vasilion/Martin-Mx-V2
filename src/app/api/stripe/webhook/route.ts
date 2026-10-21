import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getStore } from "@/lib/registrations/store";
import { getPractice, getSchedule } from "@/lib/park/live";
import { sendEmail } from "@/lib/email/ses";
import { membershipConfirmationEmail, newMemberOwnerEmail, practiceConfirmationEmail } from "@/lib/email/templates";
import { getSite } from "@/lib/park/content";

export const runtime = "nodejs";

/**
 * The source of truth for payments. Every write here is idempotent (conditional on
 * current state), so Stripe's retries never double-record or double-email.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const kind = session.metadata?.kind;

  if (event.type === "checkout.session.completed" && session.payment_status === "paid") {
    if (kind === "practice") await completePractice(session);
    if (kind === "membership") await completeMembership(session);
  } else if (event.type === "checkout.session.expired" && kind === "practice") {
    const id = session.metadata?.registrationId;
    if (id) await getStore().release(id);
  }

  return NextResponse.json({ received: true });
}

async function completePractice(session: Stripe.Checkout.Session) {
  const id = session.metadata?.registrationId;
  if (!id) return;
  const reg = await getStore().markPaid(id, new Date().toISOString());
  if (!reg) return; // already processed

  const [schedule, practice] = await Promise.all([getSchedule(), getPractice()]);
  const day = schedule.find((d) => d.date === reg.date);
  const cls = practice.classes.find((c) => c.id === reg.classId);
  const site = await getSite();
  const mail = practiceConfirmationEmail(site, {
    ...reg,
    classLabel: cls?.label ?? reg.classId,
    start: day?.start ?? "00:00",
    end: day?.end ?? "00:00",
  });
  try {
    await sendEmail({ to: reg.email, replyTo: site.email, ...mail });
  } catch (err) {
    // The registration is recorded either way; don't make Stripe retry over an email.
    console.error("practice confirmation email failed", id, err);
  }
}

function formatAddress(a: Stripe.Address | null | undefined) {
  if (!a) return undefined;
  return [a.line1, a.line2, `${a.city ?? ""}, ${a.state ?? ""} ${a.postal_code ?? ""}`.trim()].filter(Boolean).join(", ");
}

async function completeMembership(session: Stripe.Checkout.Session) {
  const details = session.customer_details;
  const shipping = session.collected_information?.shipping_details;
  const member = {
    id: session.id,
    name: shipping?.name ?? details?.name ?? "Member",
    email: details?.email ?? "",
    phone: details?.phone ?? undefined,
    address: formatAddress(shipping?.address ?? details?.address),
    amount: (session.amount_total ?? 0) / 100,
    year: Number(session.metadata?.year) || new Date().getFullYear(),
    stripeSessionId: session.id,
    createdAt: new Date().toISOString(),
  };
  const created = await getStore().putMembership(member);
  if (!created) return;

  // OWNER_NOTIFY_EMAIL lets dev/test runs avoid emailing the real owners.
  const site = await getSite();
  const ownerEmail = process.env.OWNER_NOTIFY_EMAIL || site.email;
  const sends = [sendEmail({ to: ownerEmail, replyTo: member.email || undefined, ...newMemberOwnerEmail(site, member) })];
  if (member.email) sends.push(sendEmail({ to: member.email, replyTo: site.email, ...membershipConfirmationEmail(site, member) }));
  const results = await Promise.allSettled(sends);
  results.forEach((r) => r.status === "rejected" && console.error("membership email failed", session.id, r.reason));
}
