"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { attemptLogin, changePassword, createOwner, deleteOwner, listOwners, recordLogin, resetOwnerPassword } from "@/lib/auth/owners";
import { endSession, requireOwner, startSession } from "@/lib/auth/session";
import {
  deleteRideDay as removeRideDay,
  getMembership,
  getPractice,
  getSchedule,
  parkNow,
  putDoc,
  putRideDay,
  rideDaySchema,
  type RideDay,
} from "@/lib/park/live";
import { getStore } from "@/lib/registrations/store";
import { contentSchemas, putContent, type ContentName } from "@/lib/park/content";
import { presignUpload, type UploadKind } from "@/lib/uploads";
import { updateInboxItem } from "@/lib/inbox/store";
import { getSite } from "@/lib/park/content";
import { sendEmail } from "@/lib/email/ses";
import { practiceCancelledEmail } from "@/lib/email/templates";

/**
 * Every action re-checks the session: server actions are public POST endpoints,
 * so the page-level guard alone isn't enough.
 */

export type ActionState = { ok?: boolean; error?: string; message?: string };

/** Public pages read live data per request; refresh any cached render after an edit. */
function refreshSite() {
  revalidatePath("/", "layout");
}

// --- auth -------------------------------------------------------------------

export async function login(_prev: ActionState, form: FormData): Promise<ActionState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const result = await attemptLogin(email, password);
  if (!result.ok) {
    return {
      error:
        result.reason === "locked"
          ? "Too many tries. This account is locked for 15 minutes."
          : "That email and password don't match.",
    };
  }
  await startSession(result.owner.email);
  await recordLogin(result.owner.email);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

// --- ride days ----------------------------------------------------------------

async function updateDay(date: string, patch: Partial<RideDay>) {
  const day = (await getSchedule()).find((d) => d.date === date);
  if (!day) throw new Error("That ride day no longer exists.");
  await putRideDay({ ...day, ...patch });
  refreshSite();
}

export async function setCancelled(date: string, cancelled: boolean, reason = "", notifyRiders = false): Promise<ActionState> {
  await requireOwner();
  const cancelReason = cancelled ? reason.trim().slice(0, 140) : "";
  await updateDay(date, { cancelled, cancelReason });
  if (!cancelled) return { ok: true, message: "Practice is back on." };
  if (!notifyRiders) return { ok: true, message: "Practice cancelled. The site shows it now." };
  const sent = await emailCancellation(date, cancelReason);
  return { ok: true, message: `Practice cancelled. Emailed ${sent} rider${sent === 1 ? "" : "s"}.` };
}

/** One email per paid registration (a parent registering two kids gets two, each naming the rider). */
async function emailCancellation(date: string, reason: string) {
  const [day, site, regs] = await Promise.all([
    getSchedule().then((s) => s.find((d) => d.date === date)),
    getSite(),
    getStore().listByDay(date),
  ]);
  if (!day) return 0;
  const paid = regs.filter((r) => r.status === "paid");
  const results = await Promise.allSettled(
    paid.map((r) => sendEmail({ to: r.email, replyTo: site.email, ...practiceCancelledEmail(site, { firstName: r.firstName, date, start: day.start, end: day.end, reason }) })),
  );
  results.forEach((x) => x.status === "rejected" && console.error("cancel email failed", x.reason));
  return results.filter((x) => x.status === "fulfilled").length;
}

export async function setRegistrationOpen(date: string, open: boolean): Promise<ActionState> {
  await requireOwner();
  await updateDay(date, { registrationOpen: open });
  return { ok: true, message: open ? "Online registration is open." : "Online registration is closed." };
}

/** The site-wide practice registration switch. Memberships aren't affected. */
export async function setPracticeRegistration(enabled: boolean): Promise<ActionState> {
  await requireOwner();
  const practice = await getPractice();
  await putDoc("practice", { ...practice, registrationEnabled: enabled });
  refreshSite();
  revalidatePath("/admin", "layout");
  return {
    ok: true,
    message: enabled ? "Practice registration is on. Register buttons are back on the site." : "Practice registration is off. Register buttons are hidden.",
  };
}

const rideDayForm = z
  .object({
    originalDate: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
    start: z.string().regex(/^\d{2}:\d{2}$/, "Pick a start time"),
    end: z.string().regex(/^\d{2}:\d{2}$/, "Pick an end time"),
    title: z.string().trim().min(1, "Give it a name").max(60),
    registrationOpen: z.boolean(),
  })
  .refine((v) => v.end > v.start, { message: "End time must be after the start time", path: ["end"] });

export async function saveRideDay(input: z.input<typeof rideDayForm>): Promise<ActionState> {
  await requireOwner();
  const parsed = rideDayForm.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  const v = parsed.data;
  const schedule = await getSchedule();
  const existing = schedule.find((d) => d.date === (v.originalDate ?? v.date));
  if (!v.originalDate && schedule.some((d) => d.date === v.date)) {
    return { error: "There's already a ride day on that date. Edit it instead." };
  }
  if (v.originalDate && v.originalDate !== v.date) {
    const taken = await getStore().spotsTaken(v.originalDate);
    if (Object.values(taken).some((n) => n > 0)) {
      return { error: "Riders are already registered for this day, so its date can't change. Cancel it and add a new day instead." };
    }
    if (schedule.some((d) => d.date === v.date)) return { error: "There's already a ride day on that date." };
    await removeRideDay(v.originalDate);
  }
  await putRideDay(
    rideDaySchema.parse({
      id: `ride-${v.date}`,
      date: v.date,
      start: v.start,
      end: v.end,
      title: v.title,
      registrationOpen: v.registrationOpen,
      cancelled: existing?.cancelled ?? false,
      cancelReason: existing?.cancelReason ?? "",
    }),
  );
  refreshSite();
  return { ok: true, message: v.originalDate ? "Ride day updated." : "Ride day added." };
}

export async function deleteRideDay(date: string): Promise<ActionState> {
  await requireOwner();
  const taken = await getStore().spotsTaken(date);
  if (Object.values(taken).some((n) => n > 0)) {
    return { error: "Riders are registered for this day. Cancel it instead so they see it on the site, or remove the riders first (Riders → … → Remove from list)." };
  }
  await removeRideDay(date);
  refreshSite();
  return { ok: true, message: "Ride day deleted." };
}

// --- gate -------------------------------------------------------------------

export async function setCheckedIn(id: string, checkedIn: boolean): Promise<ActionState> {
  await requireOwner();
  await getStore().setCheckedIn(id, checkedIn);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Takes a paid rider off the gate list and frees their spot. Refunds are separate (in Stripe). */
export async function removeRider(id: string): Promise<ActionState> {
  await requireOwner();
  const removed = await getStore().removeRider(id);
  revalidatePath("/admin", "layout");
  refreshSite();
  return removed ? { ok: true, message: "Rider removed. Their spot is open again." } : { error: "That rider is already off the list." };
}

// --- settings -----------------------------------------------------------------

const time = z.string().regex(/^\d{2}:\d{2}$/);
const settingsForm = z.object({
  prices: z.object({
    main: z.coerce.number().min(0).max(1000),
    junior: z.coerce.number().min(0).max(1000),
    spectator: z.coerce.number().min(0).max(1000),
  }),
  defaultCapacity: z.coerce.number().int().min(1, "Spots must be at least 1").max(500),
  hours: z.array(z.object({ day: z.string().trim().min(1), open: time, close: time })).max(7),
  hoursNote: z.string().trim().max(300),
  membership: z.object({
    open: z.boolean(),
    price: z.coerce.number().min(0).max(10000),
    perks: z.array(z.string().trim().min(1).max(80)).max(8),
  }),
});

export async function saveSettings(input: z.input<typeof settingsForm>): Promise<ActionState> {
  await requireOwner();
  const parsed = settingsForm.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  const v = parsed.data;
  const [practice, membership] = await Promise.all([getPractice(), getMembership()]);
  await putDoc("practice", { ...practice, prices: v.prices, defaultCapacity: v.defaultCapacity, hours: v.hours, hoursNote: v.hoursNote });
  await putDoc("membership", { ...membership, ...v.membership });
  refreshSite();
  return { ok: true, message: "Saved. The site is updated." };
}

const weekdayIndex: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };

/** Adds ride days for the regular weekly hours over the next N weeks, skipping dates already on the schedule. */
export async function fillRegularWeeks(weeks: number): Promise<ActionState> {
  await requireOwner();
  const n = Math.min(Math.max(Math.trunc(weeks), 1), 12);
  const [practice, schedule] = await Promise.all([getPractice(), getSchedule()]);
  const existing = new Set(schedule.map((d) => d.date));
  const today = new Date(`${parkNow().date}T12:00:00Z`);
  let added = 0;
  for (let i = 0; i < n * 7; i++) {
    const d = new Date(today.getTime() + i * 86_400_000);
    const iso = d.toISOString().slice(0, 10);
    const hours = practice.hours.find((h) => weekdayIndex[h.day.toLowerCase()] === d.getUTCDay());
    if (!hours || existing.has(iso)) continue;
    await putRideDay({ id: `ride-${iso}`, date: iso, start: hours.open, end: hours.close, title: "Open Practice", cancelled: false, cancelReason: "", registrationOpen: false });
    added++;
  }
  refreshSite();
  return added ? { ok: true, message: `Added ${added} ride day${added === 1 ? "" : "s"}.` } : { ok: true, message: "Those weeks are already on the schedule." };
}

// --- content + uploads ----------------------------------------------------------

export async function saveContent(name: ContentName, value: unknown): Promise<ActionState> {
  await requireOwner();
  if (!(name in contentSchemas)) return { error: "Unknown section." };
  const parsed = contentSchemas[name].safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue?.path.join(" › ") || "Form"}: ${issue?.message ?? "check this field"}` };
  }
  await putContent(name, parsed.data);
  refreshSite();
  return { ok: true, message: "Saved. The site is updated." };
}

export async function createUpload(input: { folder: string; contentType: string; size: number; kind: UploadKind }) {
  await requireOwner();
  try {
    return { ok: true as const, ...(await presignUpload(input.folder, input.contentType, input.size, input.kind)) };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Upload failed." };
  }
}

const sponsorList = z.array(
  z.object({
    id: z.string().min(1).max(60),
    name: z.string().trim().min(1, "Every sponsor needs a name").max(80),
    href: z.string().trim().url("Sponsor links must start with https://"),
    logo: z.string().trim().min(1, "Every sponsor needs a logo"),
    title: z.boolean(),
    active: z.boolean(),
  }),
);

export async function saveSponsors(list: unknown): Promise<ActionState> {
  await requireOwner();
  const parsed = sponsorList.safeParse(list);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the sponsors." };
  await putDoc("sponsors", { sponsors: parsed.data });
  refreshSite();
  return { ok: true, message: "Sponsors saved." };
}

// --- inbox ----------------------------------------------------------------------

export async function setInboxState(id: string, patch: { read?: boolean; archived?: boolean }): Promise<ActionState> {
  await requireOwner();
  await updateInboxItem(id, patch);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function updatePassword(current: string, next: string, confirm: string): Promise<ActionState> {
  const owner = await requireOwner();
  if (next.length < 10) return { error: "Use at least 10 characters." };
  if (next !== confirm) return { error: "The new passwords don't match." };
  if (next === current) return { error: "Pick a password different from the current one." };
  const ok = await changePassword(owner.email, current, next);
  return ok ? { ok: true, message: "Password changed." } : { error: "Your current password isn't right." };
}

// --- team -----------------------------------------------------------------------

export type TeamResult = ActionState & { password?: string };

const newMember = z.object({
  name: z.string().trim().min(1, "Enter their name").max(60),
  email: z.string().trim().email("Enter a valid email"),
});

export async function addTeamMember(input: { name: string; email: string }): Promise<TeamResult> {
  const me = await requireOwner();
  const parsed = newMember.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const res = await createOwner(parsed.data.email, parsed.data.name, me.email);
  if (!res.ok) return { error: res.error };
  revalidatePath("/admin/team");
  return { ok: true, message: `${parsed.data.name} can sign in now.`, password: res.password };
}

export async function resetTeamPassword(email: string): Promise<TeamResult> {
  const me = await requireOwner();
  if (email === me.email) return { error: "Change your own password under Settings." };
  const password = await resetOwnerPassword(email);
  revalidatePath("/admin/team");
  return { ok: true, message: "New temporary password created.", password };
}

export async function removeTeamMember(email: string): Promise<ActionState> {
  const me = await requireOwner();
  if (email === me.email) return { error: "You can't remove yourself. Ask another owner to do it." };
  const team = await listOwners();
  if (team.length <= 1) return { error: "There has to be at least one login." };
  await deleteOwner(email);
  revalidatePath("/admin/team");
  return { ok: true, message: "Access removed. They're signed out everywhere." };
}
