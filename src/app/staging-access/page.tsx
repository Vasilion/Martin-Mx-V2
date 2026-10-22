import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Logo } from "@/components/site/logo";
import { gateToken } from "@/lib/staging-gate";

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Only same-site paths, so the gate can't be used as an open redirect. */
function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

async function enter(form: FormData) {
  "use server";
  const next = safeNext(form.get("next"));
  const password = process.env.STAGING_PASSWORD;
  if (!password) redirect(next);
  if (String(form.get("password") ?? "").trim() !== password) redirect(`/staging-access?next=${encodeURIComponent(next)}&wrong=1`);
  (await cookies()).set("mx_staging", await gateToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(next);
}

export default async function StagingAccess({ searchParams }: { searchParams: Promise<{ next?: string; wrong?: string }> }) {
  const { next, wrong } = await searchParams;
  if (!process.env.STAGING_PASSWORD) redirect("/");
  return (
    <main className="grid min-h-svh place-items-center bg-ink px-4">
      <form action={enter} className="w-full max-w-sm">
        <Logo className="mx-auto h-6 w-auto" />
        <h1 className="display mt-8 text-center text-4xl text-white">
          Preview <span className="text-volt">site</span>
        </h1>
        <p className="mt-3 text-center text-white/65">This is the test version of the new Martin MX website. Enter the preview password to continue.</p>
        <input type="hidden" name="next" value={safeNext(next)} />
        <label htmlFor="pw" className="eyebrow mt-8 block text-[0.7rem] text-white/60">
          Preview password
        </label>
        <input
          id="pw"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-2 h-12 w-full rounded-sm border border-white/15 bg-ink-2 px-4 text-base text-white outline-none focus:border-volt"
        />
        {wrong && (
          <p role="alert" className="mt-2 text-sm text-danger">
            That password isn&apos;t right. Check the email you were sent.
          </p>
        )}
        <button type="submit" className="mt-5 h-12 w-full rounded-sm bg-volt font-display text-lg font-bold uppercase italic text-ink hover:bg-white">
          Continue
        </button>
      </form>
    </main>
  );
}
