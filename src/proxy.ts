import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { gateToken } from "@/lib/staging-gate";

/**
 * 1. Tags API responses with a request id.
 * 2. Staging gate: when STAGING_PASSWORD is set, every page needs a one-time password
 *    (remembered by cookie). Replaces HTTP basic auth, whose popup iPhone in-app
 *    browsers (Gmail, Messages, Facebook) never show. Unset in production.
 */

const GATE_COOKIE = "mx_staging";
// Paths that must work without the gate: the gate itself, Stripe's webhook, static assets.
const OPEN = [/^\/staging-access/, /^\/api\/stripe\/webhook/, /^\/_next\//, /^\/(favicon\.ico|icon\.png|apple-icon\.png|manifest\.webmanifest|robots\.txt)$/];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const password = process.env.STAGING_PASSWORD;

  if (password && !OPEN.some((re) => re.test(pathname))) {
    const ok = request.cookies.get(GATE_COOKIE)?.value === (await gateToken(password));
    if (!ok) {
      if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Staging site: sign in first." }, { status: 401 });
      const url = request.nextUrl.clone();
      url.pathname = "/staging-access";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  if (pathname.startsWith("/api/")) response.headers.set("x-request-id", request.headers.get("x-request-id") ?? crypto.randomUUID());
  if (password) response.headers.set("x-robots-tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
