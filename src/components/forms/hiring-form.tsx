"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { ChoiceGroup, Honeypot, SiteInput, SiteTextarea, SubmitButton, useSiteForm } from "@/components/forms/site-form";

const yesNo = ["Yes", "No"] as const;

export function HiringForm({ positions, availability }: { positions: string[]; availability: string[] }) {
  const f = useSiteForm("/api/apply");
  const [choices, setChoices] = useState({ position: "", availability: "", customerService: "", industry: "", rides: "", procedures: "" });
  const pick = (k: keyof typeof choices) => (v: string) => {
    setChoices((c) => ({ ...c, [k]: v }));
    f.setErrors(({ [k]: _, ...rest }) => rest);
  };

  if (f.done) {
    return (
      <div className="rounded-sm border border-volt/40 bg-volt/10 p-8">
        <span className="grid size-12 place-items-center rounded-sm bg-volt text-ink">
          <Check className="size-6" strokeWidth={3} aria-hidden />
        </span>
        <h2 className="display mt-6 text-5xl text-white">Application sent.</h2>
        <p className="mt-3 max-w-lg text-white/75">Thanks for applying. We sent a confirmation to your email and will reach out if it&apos;s a fit.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        f.submit({ ...data, ...choices });
      }}
      className="relative space-y-12"
    >
      <Honeypot />
      <section className="space-y-5">
        <h2 className="font-display text-2xl font-bold uppercase italic text-white">About you</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <SiteInput name="firstName" label="First name" autoComplete="given-name" error={f.errors.firstName} />
          <SiteInput name="lastName" label="Last name" autoComplete="family-name" error={f.errors.lastName} />
          <SiteInput name="email" label="Email" type="email" autoComplete="email" error={f.errors.email} />
          <SiteInput name="phone" label="Phone" type="tel" autoComplete="tel" error={f.errors.phone} />
          <SiteInput name="age" label="Age" type="number" inputMode="numeric" min={16} error={f.errors.age} />
          <SiteInput name="city" label="City" autoComplete="address-level2" error={f.errors.city} />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold uppercase italic text-white">The job</h2>
        <ChoiceGroup name="position" label="Position" options={positions} value={choices.position} onChange={pick("position")} error={f.errors.position} />
        <ChoiceGroup name="availability" label="Availability" options={availability} value={choices.availability} onChange={pick("availability")} error={f.errors.availability} />
        <SiteInput name="startWhen" label="How soon can you start training?" error={f.errors.startWhen} />
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-bold uppercase italic text-white">Experience</h2>
        <ChoiceGroup name="customerService" label="Customer service experience?" options={yesNo} value={choices.customerService} onChange={pick("customerService")} error={f.errors.customerService} />
        <ChoiceGroup name="industry" label="Familiar with the motocross industry?" options={yesNo} value={choices.industry} onChange={pick("industry")} error={f.errors.industry} />
        <ChoiceGroup name="rides" label="Do you ride motocross?" options={yesNo} value={choices.rides} onChange={pick("rides")} error={f.errors.rides} />
        <ChoiceGroup
          name="procedures"
          label="Familiar with track operating procedures?"
          options={["Very familiar", "Somewhat familiar", "Not familiar"]}
          value={choices.procedures}
          onChange={pick("procedures")}
          error={f.errors.procedures}
        />
        <SiteTextarea name="extra" label="Anything else you'd like us to know? (optional)" maxLength={2000} error={f.errors.extra} />
      </section>

      {f.formError && (
        <p role="alert" className="rounded-sm border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {f.formError}
        </p>
      )}
      <SubmitButton pending={f.pending}>Send application</SubmitButton>
    </form>
  );
}
