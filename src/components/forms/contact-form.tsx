"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { ChoiceGroup, Honeypot, SiteInput, SiteTextarea, SubmitButton, useSiteForm } from "@/components/forms/site-form";

const topics = ["Practice & riding", "Membership", "Events", "Sponsoring", "Other"] as const;

export function ContactForm() {
  const f = useSiteForm("/api/contact");
  const [topic, setTopic] = useState("");

  if (f.done) {
    return (
      <div className="rounded-sm border border-volt/40 bg-volt/10 p-8">
        <span className="grid size-12 place-items-center rounded-sm bg-volt text-ink">
          <Check className="size-6" strokeWidth={3} aria-hidden />
        </span>
        <h2 className="display mt-6 text-5xl text-white">Message sent.</h2>
        <p className="mt-3 max-w-lg text-white/75">Thanks. We sent a copy to your email and will get back to you soon.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        f.submit({ ...Object.fromEntries(new FormData(e.currentTarget)), topic: topic || "General" });
      }}
      className="relative space-y-6"
    >
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <SiteInput name="name" label="Name" autoComplete="name" error={f.errors.name} className="sm:col-span-2" />
        <SiteInput name="email" label="Email" type="email" autoComplete="email" error={f.errors.email} />
        <SiteInput name="phone" label="Phone (optional)" type="tel" autoComplete="tel" error={f.errors.phone} />
      </div>
      <ChoiceGroup name="topic" label="What's it about?" options={topics} value={topic} onChange={setTopic} />
      <SiteTextarea name="message" label="Message" maxLength={3000} error={f.errors.message} />
      {f.formError && (
        <p role="alert" className="rounded-sm border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {f.formError}
        </p>
      )}
      <SubmitButton pending={f.pending}>Send message</SubmitButton>
    </form>
  );
}
