"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Dark-site form pieces shared by hiring + contact (same look as the register form). */

const inputClass = "h-12 rounded-sm border-white/15 bg-ink-2 px-4 text-base text-white placeholder:text-white/30";

export function FieldShell({ id, label, error, children, className }: { id: string; label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="eyebrow text-[0.7rem] text-white/60">
        {label}
      </Label>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function SiteInput({
  name,
  label,
  error,
  className,
  ...props
}: { name: string; label: string; error?: string; className?: string } & React.ComponentProps<"input">) {
  const id = `f-${name}`;
  return (
    <FieldShell id={id} label={label} error={error} className={className}>
      <Input id={id} name={name} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={inputClass} {...props} />
    </FieldShell>
  );
}

export function SiteTextarea({ name, label, error, className, ...props }: { name: string; label: string; error?: string; className?: string } & React.ComponentProps<"textarea">) {
  const id = `f-${name}`;
  return (
    <FieldShell id={id} label={label} error={error} className={className}>
      <Textarea id={id} name={name} aria-invalid={!!error} className="min-h-32 rounded-sm border-white/15 bg-ink-2 px-4 py-3 text-base text-white placeholder:text-white/30" {...props} />
    </FieldShell>
  );
}

/** Radio choices as big tappable chips. */
export function ChoiceGroup({ name, label, options, value, onChange, error, className }: { name: string; label: string; options: readonly string[]; value: string; onChange: (v: string) => void; error?: string; className?: string }) {
  return (
    <fieldset id={`f-${name}`} tabIndex={-1} className={cn("outline-none", className)}>
      <legend className="eyebrow text-[0.7rem] text-white/60">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-sm border px-4 py-3 text-sm font-semibold transition",
              value === o ? "border-volt bg-volt/10 text-white" : "border-white/15 bg-ink-2 text-white/75 hover:border-white/35",
            )}
          >
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="sr-only" />
            {value === o && <Check className="size-4 text-volt" strokeWidth={3} aria-hidden />}
            {o}
          </label>
        ))}
      </div>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </fieldset>
  );
}

/**
 * Posts JSON to an endpoint with spam guards (hidden field + time since the form loaded).
 * Returns field errors for inline display.
 */
export function useSiteForm(endpoint: string) {
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(data: Record<string, unknown>) {
    setPending(true);
    setFormError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, startedAt: startedAt.current }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrors(body.fields ?? {});
        setFormError(body.error ?? "Something went wrong. Please try again.");
        const first = Object.keys(body.fields ?? {})[0];
        if (first) document.getElementById(`f-${first}`)?.focus();
      }
    } catch {
      setFormError("Couldn't reach the server. Check your connection and try again.");
    }
    setPending(false);
  }

  return { submit, errors, setErrors, formError, pending, done };
}

/** Hidden from people, irresistible to bots. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" variant="race" size="2xl" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {pending ? "Sending…" : children}
      {!pending && <ArrowRight aria-hidden />}
    </Button>
  );
}
