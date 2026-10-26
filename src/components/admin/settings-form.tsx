"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveSettings } from "@/app/admin/actions";
import type { Membership, Practice } from "@/lib/park/live";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-4 md:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Money({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
        <Input id={id} type="number" inputMode="decimal" min={0} step="1" value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-12 pl-7 text-base" />
      </div>
    </div>
  );
}

export function SettingsForm({ practice, membership }: { practice: Practice; membership: Membership }) {
  const [pending, start] = useTransition();
  const [prices, setPrices] = useState(practice.prices);
  const [capacity, setCapacity] = useState(practice.defaultCapacity);
  const [hours, setHours] = useState(practice.hours);
  const [hoursNote, setHoursNote] = useState(practice.hoursNote);
  const [mem, setMem] = useState(membership);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await saveSettings({
        prices,
        defaultCapacity: capacity,
        hours,
        hoursNote,
        membership: { ...mem, perks: mem.perks.map((p) => p.trim()).filter(Boolean) },
      });
      if (res.error) toast.error(res.error);
      else toast.success(res.message);
    });
  };

  return (
    <form onSubmit={save} className="space-y-5">
      <Section title="Practice prices" hint="What riders pay online. Shown across the site.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Money id="p-main" label="Main track (per class)" value={prices.main} onChange={(v) => setPrices({ ...prices, main: v })} />
          <Money id="p-jr" label="Junior track" value={prices.junior} onChange={(v) => setPrices({ ...prices, junior: v })} />
          <Money id="p-spec" label="Spectators" value={prices.spectator} onChange={(v) => setPrices({ ...prices, spectator: v })} />
        </div>
      </Section>

      <Section title="Spots per class" hint="Online registration closes for a class once this many riders have signed up for a day.">
        <div className="max-w-40 space-y-2">
          <Label htmlFor="cap">Spots</Label>
          <Input id="cap" type="number" inputMode="numeric" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="h-12 text-base" />
        </div>
      </Section>

      <Section title="Regular hours" hint="Shown on the site and used by “Fill next 4 weeks” on the schedule.">
        <ul className="space-y-3">
          {hours.map((h, i) => (
            <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 rounded-lg border p-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:border-0 sm:p-0">
              <div className="col-span-2 space-y-1.5 sm:col-span-1">
                <Label htmlFor={`h-day-${i}`} className="text-xs">Day</Label>
                <select
                  id={`h-day-${i}`}
                  value={h.day}
                  onChange={(e) => setHours(hours.map((x, j) => (j === i ? { ...x, day: e.target.value } : x)))}
                  className="h-12 w-full rounded-md border border-input bg-card px-3 text-base"
                >
                  {days.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2 min-[480px]:grid-cols-2 sm:contents">
                <div className="space-y-1.5">
                  <Label htmlFor={`h-open-${i}`} className="text-xs">Opens</Label>
                  <Input id={`h-open-${i}`} type="time" value={h.open} onChange={(e) => setHours(hours.map((x, j) => (j === i ? { ...x, open: e.target.value } : x)))} className="h-12 w-full text-base" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`h-close-${i}`} className="text-xs">Closes</Label>
                  <Input id={`h-close-${i}`} type="time" value={h.close} onChange={(e) => setHours(hours.map((x, j) => (j === i ? { ...x, close: e.target.value } : x)))} className="h-12 w-full text-base" />
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon-lg" className="size-12" aria-label={`Remove ${h.day}`} onClick={() => setHours(hours.filter((_, j) => j !== i))}>
                <X />
              </Button>
            </li>
          ))}
        </ul>
        {hours.length < 7 && (
          <Button type="button" variant="outline" className="h-11" onClick={() => setHours([...hours, { day: days.find((d) => !hours.some((h) => h.day === d)) ?? "Monday", open: "10:00", close: "15:00" }])}>
            <Plus /> Add a day
          </Button>
        )}
        <div className="space-y-2">
          <Label htmlFor="h-note">Note under the hours</Label>
          <Textarea id="h-note" value={hoursNote} maxLength={300} onChange={(e) => setHoursNote(e.target.value)} className="min-h-20 text-base" />
        </div>
      </Section>

      <Section title="Yearly membership">
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4">
          <span>
            <span className="block font-semibold">Memberships on sale</span>
            <span className="block text-sm text-muted-foreground">{mem.open ? "Riders can buy online" : "Hidden on the site"}</span>
          </span>
          <Switch checked={mem.open} onCheckedChange={(v) => setMem({ ...mem, open: v })} className="scale-125 data-[state=checked]:bg-brand" />
        </label>
        <div className="max-w-48">
          <Money id="m-price" label="Price per year" value={mem.price} onChange={(v) => setMem({ ...mem, price: v })} />
        </div>
        <div className="space-y-2">
          <Label>What&apos;s included</Label>
          {mem.perks.map((p, i) => (
            <div key={i} className="flex gap-2">
              <Input value={p} maxLength={80} onChange={(e) => setMem({ ...mem, perks: mem.perks.map((x, j) => (j === i ? e.target.value : x)) })} className="h-12 text-base" aria-label={`Perk ${i + 1}`} />
              <Button type="button" variant="ghost" size="icon-lg" className="size-12 shrink-0" aria-label="Remove" onClick={() => setMem({ ...mem, perks: mem.perks.filter((_, j) => j !== i) })}>
                <X />
              </Button>
            </div>
          ))}
          {mem.perks.length < 8 && (
            <Button type="button" variant="outline" className="h-11" onClick={() => setMem({ ...mem, perks: [...mem.perks, ""] })}>
              <Plus /> Add
            </Button>
          )}
        </div>
      </Section>

      {/* Sticky save bar, above the phone tab bar */}
      <div className="sticky bottom-20 z-30 rounded-lg border bg-card/95 p-3 shadow-lg backdrop-blur lg:bottom-4">
        <Button type="submit" disabled={pending} className="h-12 w-full text-base font-semibold">
          {pending && <Loader2 className="animate-spin" />} Save changes
        </Button>
      </div>
    </form>
  );
}
