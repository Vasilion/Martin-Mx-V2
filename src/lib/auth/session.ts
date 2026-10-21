import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth/owners";

/**
 * Stateless signed session cookie: base64url(email|expiresAtMs).hmac
 * Each request re-checks the owner still exists, so deleting an owner revokes access.
 */
const COOKIE = "mx_owner";
const MAX_AGE_DAYS = 30;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ chars).");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function startSession(email: string) {
  const exp = Date.now() + MAX_AGE_DAYS * 86_400_000;
  const payload = Buffer.from(`${email}|${exp}`).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_DAYS * 86_400,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

async function sessionEmail(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, mac] = raw.split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const [email, exp] = Buffer.from(payload, "base64url").toString().split("|");
  if (!email || !exp || Number(exp) < Date.now()) return null;
  return email;
}

export async function currentOwner() {
  const email = await sessionEmail();
  if (!email) return null;
  const owner = await getOwner(email);
  return owner ? { email: owner.email, name: owner.name } : null;
}

/** Use at the top of every dashboard page and server action. */
export async function requireOwner() {
  const owner = await currentOwner();
  if (!owner) redirect("/admin/login");
  return owner;
}
