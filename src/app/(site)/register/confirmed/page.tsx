import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDownToLine, ArrowRight, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStripe } from "@/lib/stripe";
import { getStore } from "@/lib/registrations/store";
import { getPractice, getSchedule } from "@/lib/park/live";
import { formatDay, formatPrice, formatTimeRange } from "@/lib/park/format";
import { getSite } from "@/lib/park/content";

export const metadata: Metadata = { title: "You're registered", robots: { index: false } };
export const dynamic = "force-dynamic";

function Shell({ eyebrow, title, accent, children }: { eyebrow: string; title: string; accent: string; children: React.ReactNode }) {
  return (
    <section className="grain relative isolate min-h-[80svh] overflow-hidden bg-ink pb-24 pt-32 md:pt-40">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_oklab,var(--brand)_40%,transparent),transparent_55%)]" />
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <span className="grid size-14 place-items-center rounded-sm bg-volt text-ink">
          <Check className="size-7" strokeWidth={3} aria-hidden />
        </span>
        <p className="eyebrow mt-8 text-volt">{eyebrow}</p>
        <h1 className="display mt-4 text-[clamp(3rem,8vw,6rem)] text-white">
          {title} <span className="block text-volt">{accent}</span>
        </h1>
        {children}
      </div>
    </section>
  );
}

export default async function ConfirmedPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  if (!session_id?.startsWith("cs_")) redirect("/register");

  let session;
  try {
    session = await getStripe().checkout.sessions.retrieve(session_id);
  } catch {
    redirect("/register");
  }
  if (session.payment_status !== "paid") redirect("/register");

  if (session.metadata?.kind === "membership") {
    return (
      <Shell eyebrow="Membership confirmed" title="Welcome to" accent="unlimited.">
        <p className="mt-6 max-w-xl text-lg text-white/75">
          You&apos;re paid up for the season. We&apos;ll mail your membership card to the address you entered. Show it at
          check-in and ride any open day.
        </p>
        <p className="mt-4 flex items-center gap-2 text-white/60">
          <Mail className="size-4 text-volt" aria-hidden /> A receipt is on its way to {session.customer_details?.email}.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild variant="race" size="xl">
            <Link href="/schedule">
              See ride days <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </Shell>
    );
  }

  const reg = session.metadata?.registrationId ? await getStore().get(session.metadata.registrationId) : null;
  if (!reg) redirect("/register");
  const [schedule, practice, site] = await Promise.all([getSchedule(), getPractice(), getSite()]);
  const day = schedule.find((d) => d.date === reg.date);
  const cls = practice.classes.find((c) => c.id === reg.classId);

  const details: [string, string][] = [
    ["Rider", `${reg.firstName} ${reg.lastName} #${reg.riderNumber}`],
    ["Class", `${cls?.label ?? reg.classId} · ${cls?.track === "junior" ? "Junior" : "Main"} track`],
    ["Ride day", day ? `${formatDay(day.date, "long")}, ${formatTimeRange(day.start, day.end)}` : formatDay(reg.date, "long")],
    ["Paid", formatPrice(reg.amount)],
    ["Confirmation", reg.id.slice(0, 8).toUpperCase()],
  ];

  return (
    <Shell eyebrow="Registration confirmed" title="You're on" accent="the gate list.">
      <dl className="mt-10 divide-y divide-white/10 border-y border-white/10">
        {details.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between">
            <dt className="eyebrow text-[0.7rem] text-white/50">{k}</dt>
            <dd className="font-semibold text-white">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 flex items-center gap-2 text-white/60">
        <Mail className="size-4 shrink-0 text-volt" aria-hidden /> Confirmation sent to {reg.email}. Bring an ID and that email to check-in.
      </p>
      {reg.ageGroup === "minor" && (
        <p className="mt-4 rounded-sm border-l-4 border-caution bg-caution/10 p-4 text-white/85">
          Riders under 18 need a parent or legal guardian on site all day. If a parent can&apos;t come, bring a notarized
          Guardian Release.
        </p>
      )}
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="race" size="xl">
          <Link href="/track-info#waivers">
            <ArrowDownToLine aria-hidden /> Print waivers
          </Link>
        </Button>
        <Button asChild variant="race-outline" size="xl">
          <Link href={`/register?day=${reg.date}`}>Register another rider</Link>
        </Button>
      </div>
      <p className="mt-8 text-sm text-white/50">
        Questions? Call{" "}
        <a href={site.phoneHref} className="text-white/80 hover:text-volt">
          {site.phone}
        </a>
        .
      </p>
    </Shell>
  );
}
