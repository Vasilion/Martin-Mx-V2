"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { practiceRegistrationSchema } from "@/lib/register/schema";
import { formatDay, formatPrice, formatTimeRange, monthDay, weekdayOf } from "@/lib/park/format";

export type OpenDay = {
  date: string;
  start: string;
  end: string;
  title: string;
  /** Spots left per class id; omitted when unknown. */
  spotsLeft?: Record<string, number>;
};

export type ClassOption = { id: string; label: string; track: "main" | "junior"; price: number };

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  riderNumber: string;
  bikeSize: string;
  ageGroup: "" | "adult" | "minor";
};

const LOW_SPOTS = 6;

function SectionLabel({ n, title, done }: { n: number; title: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-sm font-display text-lg font-bold italic",
          done ? "bg-volt text-ink" : "border border-white/20 text-white/70",
        )}
      >
        {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : n}
      </span>
      <h2 className="font-display text-2xl font-bold uppercase italic text-white md:text-3xl">{title}</h2>
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-danger">
      {message}
    </p>
  );
}

export function PracticeForm({ days, classes, initialDate }: { days: OpenDay[]; classes: ClassOption[]; initialDate?: string }) {
  const [date, setDate] = useState(() => days.find((d) => d.date === initialDate)?.date ?? (days.length === 1 ? days[0].date : ""));
  const [classId, setClassId] = useState("");
  const [fields, setFields] = useState<Fields>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    riderNumber: "",
    bikeSize: "",
    ageGroup: "",
  });
  const [waiverAck, setWaiverAck] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const day = days.find((d) => d.date === date);
  const cls = classes.find((c) => c.id === classId);
  const spotsFor = (c: string) => day?.spotsLeft?.[c];
  const riderDone = useMemo(
    () => practiceRegistrationSchema.pick({ firstName: true, lastName: true, email: true, phone: true, riderNumber: true, bikeSize: true, ageGroup: true }).safeParse(fields).success,
    [fields],
  );

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const parsed = practiceRegistrationSchema.safeParse({ date, classId, ...fields, waiverAck });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      document.getElementById(`field-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/practice", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.url) {
        window.location.assign(body.url);
        return;
      }
      setFormError(body.error ?? "Something went wrong starting checkout. Please try again.");
    } catch {
      setFormError("Couldn't reach the server. Check your connection and try again.");
    }
    setSubmitting(false);
  }

  const inputClass = "h-12 rounded-sm border-white/15 bg-ink-2 px-4 text-base text-white placeholder:text-white/30";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="space-y-14 lg:col-span-8">
        {/* 1. Ride day */}
        <fieldset>
          <legend className="sr-only">Ride day</legend>
          <SectionLabel n={1} title="Ride day" done={!!day} />
          <div id="field-date" tabIndex={-1} className="mt-6 grid gap-3 outline-none sm:grid-cols-2">
            {days.map((d) => {
              const { month, day: dom } = monthDay(d.date);
              const selected = d.date === date;
              return (
                <label
                  key={d.date}
                  className={cn(
                    "flex cursor-pointer items-center gap-5 rounded-sm border bg-ink-2 p-5 transition",
                    selected ? "border-volt ring-1 ring-volt" : "border-white/12 hover:border-white/35",
                  )}
                >
                  <input
                    type="radio"
                    name="date"
                    value={d.date}
                    checked={selected}
                    onChange={() => {
                      setDate(d.date);
                      setErrors(({ date: _, ...rest }) => rest);
                    }}
                    className="sr-only"
                  />
                  <span className="flex flex-col items-center">
                    <span className="eyebrow text-[0.65rem] text-white/50">{month}</span>
                    <span className="display text-5xl text-white">{dom}</span>
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-xl font-bold uppercase italic text-white">{weekdayOf(d.date, "long")}</span>
                    <span className="block text-sm text-white/60">
                      {d.title} · {formatTimeRange(d.start, d.end)}
                    </span>
                  </span>
                  <span className={cn("grid size-5 place-items-center rounded-full border", selected ? "border-volt bg-volt" : "border-white/30")} aria-hidden>
                    {selected && <span className="size-2 rounded-full bg-ink" />}
                  </span>
                </label>
              );
            })}
          </div>
          <FieldError id="err-date" message={errors.date} />
        </fieldset>

        {/* 2. Class */}
        <fieldset>
          <legend className="sr-only">Class</legend>
          <SectionLabel n={2} title="Class" done={!!cls} />
          <div id="field-classId" tabIndex={-1} className="mt-6 grid grid-cols-2 gap-3 outline-none md:grid-cols-4">
            {classes.map((c) => {
              const left = spotsFor(c.id);
              const soldOut = left === 0;
              const selected = c.id === classId;
              return (
                <label
                  key={c.id}
                  className={cn(
                    "relative flex flex-col justify-between gap-6 rounded-sm border bg-ink-2 p-5 transition",
                    soldOut ? "cursor-not-allowed opacity-40" : "cursor-pointer",
                    selected ? "border-volt ring-1 ring-volt" : "border-white/12 hover:border-white/35",
                  )}
                >
                  <input
                    type="radio"
                    name="classId"
                    value={c.id}
                    checked={selected}
                    disabled={soldOut}
                    onChange={() => {
                      setClassId(c.id);
                      setErrors(({ classId: _, ...rest }) => rest);
                    }}
                    className="sr-only"
                  />
                  <span>
                    <span className="eyebrow block text-[0.65rem] text-white/50">{c.track === "main" ? "Main track" : "Junior track"}</span>
                    <span className="display mt-2 block text-4xl text-white">{c.label}</span>
                  </span>
                  <span className="flex items-end justify-between gap-2">
                    <span className="display text-2xl text-volt">{formatPrice(c.price)}</span>
                    {soldOut ? (
                      <span className="eyebrow text-[0.6rem] text-danger">Full</span>
                    ) : left !== undefined && left <= LOW_SPOTS ? (
                      <span className="eyebrow text-[0.6rem] text-caution">{left} left</span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
          <FieldError id="err-classId" message={errors.classId} />
        </fieldset>

        {/* 3. Rider */}
        <fieldset>
          <legend className="sr-only">Rider</legend>
          <SectionLabel n={3} title="Rider" done={riderDone} />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {(
              [
                ["firstName", "First name", "text", "given-name"],
                ["lastName", "Last name", "text", "family-name"],
                ["email", "Email", "email", "email"],
                ["phone", "Phone", "tel", "tel"],
                ["riderNumber", "Rider number", "text", "off"],
                ["bikeSize", "Bike size (cc)", "number", "off"],
              ] as const
            ).map(([key, label, type, autoComplete]) => (
              <div key={key}>
                <Label htmlFor={`field-${key}`} className="eyebrow text-[0.7rem] text-white/60">
                  {label}
                </Label>
                <Input
                  id={`field-${key}`}
                  type={type}
                  inputMode={key === "bikeSize" ? "numeric" : undefined}
                  autoComplete={autoComplete}
                  value={fields[key]}
                  onChange={set(key)}
                  aria-invalid={!!errors[key]}
                  aria-describedby={errors[key] ? `err-${key}` : undefined}
                  placeholder={key === "bikeSize" ? "e.g. 250" : key === "riderNumber" ? "e.g. 292" : undefined}
                  className={cn("mt-2", inputClass)}
                />
                <FieldError id={`err-${key}`} message={errors[key]} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <span className="eyebrow text-[0.7rem] text-white/60">Rider age</span>
              <div id="field-ageGroup" tabIndex={-1} className="mt-2 grid grid-cols-2 gap-3 outline-none">
                {(
                  [
                    ["adult", "Adult", "18 or older"],
                    ["minor", "Minor", "Under 18 · parent on site"],
                  ] as const
                ).map(([value, label, sub]) => (
                  <label
                    key={value}
                    className={cn(
                      "cursor-pointer rounded-sm border bg-ink-2 px-4 py-3 transition",
                      fields.ageGroup === value ? "border-volt ring-1 ring-volt" : "border-white/12 hover:border-white/35",
                    )}
                  >
                    <input
                      type="radio"
                      name="ageGroup"
                      value={value}
                      checked={fields.ageGroup === value}
                      onChange={() => {
                        setFields((f) => ({ ...f, ageGroup: value }));
                        setErrors(({ ageGroup: _, ...rest }) => rest);
                      }}
                      className="sr-only"
                    />
                    <span className="block font-display text-lg font-bold uppercase italic text-white">{label}</span>
                    <span className="block text-xs text-white/55">{sub}</span>
                  </label>
                ))}
              </div>
              <FieldError id="err-ageGroup" message={errors.ageGroup} />
            </div>
          </div>
        </fieldset>

        {/* 4. Waiver */}
        <fieldset>
          <legend className="sr-only">Waiver</legend>
          <SectionLabel n={4} title="Waiver" done={waiverAck} />
          <label
            htmlFor="field-waiverAck"
            className={cn(
              "mt-6 flex cursor-pointer gap-4 rounded-sm border bg-ink-2 p-5 transition",
              errors.waiverAck ? "border-danger" : waiverAck ? "border-volt" : "border-white/12 hover:border-white/35",
            )}
          >
            <Checkbox
              id="field-waiverAck"
              checked={waiverAck}
              onCheckedChange={(v) => {
                setWaiverAck(v === true);
                setErrors(({ waiverAck: _, ...rest }) => rest);
              }}
              className="mt-0.5 size-5 rounded-[3px] border-white/40 data-[state=checked]:border-volt data-[state=checked]:bg-volt data-[state=checked]:text-ink"
            />
            <span className="text-white/80">
              I understand every rider and spectator signs a liability waiver at check-in, and riders under 18 need a
              parent or legal guardian on site (or a notarized{" "}
              <a href="/media/waivers/guardian-release.pdf" target="_blank" rel="noreferrer" className="text-volt underline underline-offset-4">
                guardian release
              </a>
              ).
            </span>
          </label>
          <FieldError id="err-waiverAck" message={errors.waiverAck} />
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="lg:col-span-4">
        <div className="rounded-sm border border-white/12 bg-ink-2 lg:sticky lg:top-28">
          <div className="h-1 bg-volt" aria-hidden />
          <div className="p-6">
            <p className="eyebrow text-white/50">Your registration</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-white/55">Ride day</dt>
                <dd className="text-right font-semibold text-white">
                  {day ? `${formatDay(day.date)} · ${formatTimeRange(day.start, day.end)}` : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-white/55">Class</dt>
                <dd className="font-semibold text-white">{cls ? `${cls.label} · ${cls.track === "main" ? "Main" : "Junior"} track` : "—"}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-white/55">Rider</dt>
                <dd className="truncate text-right font-semibold text-white">
                  {fields.firstName || fields.lastName ? `${fields.firstName} ${fields.lastName}`.trim() : "—"}
                  {fields.riderNumber && <span className="text-white/55"> #{fields.riderNumber}</span>}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex items-baseline justify-between">
              <span className="eyebrow text-white/60">Total</span>
              <span className="display text-5xl text-volt">{cls ? formatPrice(cls.price) : "$—"}</span>
            </div>
            {formError && (
              <p role="alert" className="mt-5 rounded-sm border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
                {formError}
              </p>
            )}
            <Button type="submit" variant="race" size="2xl" disabled={submitting} className="mt-6 w-full">
              {submitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {submitting ? "Starting checkout…" : "Continue to payment"}
              {!submitting && <ArrowRight aria-hidden />}
            </Button>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/50">
              <Lock className="size-3.5" aria-hidden /> Secure checkout by Stripe. Your spot is held the moment you pay.
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
