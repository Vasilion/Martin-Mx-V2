import "server-only";
import { addInboxItem, type InboxItem } from "@/lib/inbox/store";
import { getSite } from "@/lib/park/content";
import { sendEmail } from "@/lib/email/ses";
import { inboxOwnerEmail, inboxReceiptEmail } from "@/lib/email/templates";

/** Bots fill hidden fields and submit instantly; people do neither. */
export function looksLikeBot(body: { website?: unknown; startedAt?: unknown }) {
  const elapsed = Date.now() - Number(body.startedAt);
  return Boolean(body.website) || !Number.isFinite(elapsed) || elapsed < 3000;
}

/** Saves to the inbox, emails the owners (reply-to the sender) and sends the sender a receipt. */
export async function submitToInbox(item: Omit<InboxItem, "id" | "createdAt" | "read" | "archived">) {
  const saved = await addInboxItem(item);
  const site = await getSite();
  const ownerEmail = process.env.OWNER_NOTIFY_EMAIL || site.email;
  const results = await Promise.allSettled([
    sendEmail({ to: ownerEmail, replyTo: item.email, ...inboxOwnerEmail(site, item) }),
    sendEmail({ to: item.email, replyTo: site.email, ...inboxReceiptEmail(site, item) }),
  ]);
  results.forEach((r) => r.status === "rejected" && console.error(`inbox ${item.kind} email failed`, saved.id, r.reason));
  return saved;
}

/** zod issues -> { field: message } for inline form errors. */
export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0])] ??= i.message;
  return out;
}
