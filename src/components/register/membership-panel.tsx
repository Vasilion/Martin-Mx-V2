"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, CreditCard, Loader2, Lock, Mail, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Membership } from "@/lib/park/live";
import { formatPrice } from "@/lib/park/format";

const steps = [
  { icon: CreditCard, title: "Pay online", body: "One secure payment covers the whole year." },
  { icon: Mail, title: "Get your card", body: "Your membership card is mailed to the address you enter at checkout." },
  { icon: Flag, title: "Ride any open day", body: "Show your card at check-in and ride, every open practice, all season." },
];

export function MembershipPanel({ membership, phone, phoneHref }: { membership: Membership; phone: string; phoneHref: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function join() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/membership", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.url) {
        window.location.assign(body.url);
        return;
      }
      setError(body.error ?? "Something went wrong starting checkout. Please try again.");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    }
    setSubmitting(false);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <section className="grain relative isolate overflow-hidden rounded-sm bg-brand lg:col-span-7">
        <Image src="/photos/roost-292.jpg" alt="" fill sizes="(min-width: 1024px) 58vw, 100vw" className="-z-10 object-cover object-[70%_center] opacity-30 mix-blend-luminosity" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand via-brand/90 to-brand/40" />
        <div className="flex h-full flex-col justify-between gap-12 p-7 md:p-10">
          <div>
            <p className="eyebrow text-white/80">Yearly membership</p>
            <h2 className="display mt-4 text-[clamp(3rem,6vw,5.5rem)] text-white">
              Unlimited.
              <br />
              All season.
            </h2>
          </div>
          <div>
            <p className="flex items-baseline gap-3">
              <span className="display text-8xl text-white">{formatPrice(membership.price)}</span>
              <span className="eyebrow text-white/85">/ year</span>
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {membership.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-white">
                  <Check className="size-5 shrink-0" strokeWidth={3} aria-hidden /> {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="flex flex-col lg:col-span-5">
        <h2 className="font-display text-2xl font-bold uppercase italic text-white md:text-3xl">How it works</h2>
        <ol className="mt-6 divide-y divide-white/10 border-y border-white/10">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-5 py-5">
              <span className="display w-8 shrink-0 text-4xl text-white/20">{i + 1}</span>
              <div>
                <p className="flex items-center gap-2.5 font-display text-xl font-bold uppercase italic text-white">
                  <s.icon className="size-4 text-volt" aria-hidden /> {s.title}
                </p>
                <p className="mt-1 text-white/65">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-auto pt-8">
          {membership.open ? (
            <>
              {error && (
                <p role="alert" className="mb-4 rounded-sm border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
                  {error}
                </p>
              )}
              <Button variant="race" size="2xl" className="w-full" onClick={join} disabled={submitting}>
                {submitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
                {submitting ? "Starting checkout…" : `Join for ${formatPrice(membership.price)}`}
                {!submitting && <ArrowRight aria-hidden />}
              </Button>
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/50">
                <Lock className="size-3.5" aria-hidden /> Secure checkout by Stripe
              </p>
            </>
          ) : (
            <div className="rounded-sm border border-white/12 bg-ink-2 p-5">
              <p className="font-semibold text-white">Memberships aren&apos;t on sale right now.</p>
              <p className="mt-1 text-sm text-white/60">
                Call{" "}
                <a href={phoneHref} className="text-volt">
                  {phone}
                </a>{" "}
                to ask about next season.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
