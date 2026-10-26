"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { saveRideDay } from "@/app/admin/actions";
import type { RideDay } from "@/lib/park/live";

type Defaults = { start: string; end: string };

/** Add/edit is one sheet: `day` present = edit. Slides up from the bottom on phones. */
export function RideDayForm({
  open,
  onOpenChange,
  day,
  defaults,
  side,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day?: RideDay;
  defaults: Defaults;
  side: "bottom" | "right";
}) {
  const [pending, start] = useTransition();
  const [form, setForm] = useState(() => ({
    date: day?.date ?? "",
    start: day?.start ?? defaults.start,
    end: day?.end ?? defaults.end,
    title: day?.title ?? "Open Practice",
    registrationOpen: day?.registrationOpen ?? false,
  }));
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await saveRideDay({ ...form, originalDate: day?.date });
      if (res.error) setError(res.error);
      else {
        toast.success(res.message);
        onOpenChange(false);
      }
    });
  };

  const field = "h-12 w-full bg-card text-base";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className="theme-admin max-h-[92svh] overflow-y-auto rounded-t-2xl sm:max-w-md sm:rounded-none">
        <SheetHeader>
          <SheetTitle className="text-xl">{day ? "Edit ride day" : "Add a ride day"}</SheetTitle>
          <SheetDescription>Shows on the site schedule as soon as you save.</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-5 px-4 pb-8">
          <div className="space-y-2">
            <Label htmlFor="rd-date">Date</Label>
            <Input id="rd-date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={field} />
          </div>
          <div className="grid gap-3 min-[480px]:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rd-start">Opens</Label>
              <Input id="rd-start" type="time" required value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className={field} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rd-end">Closes</Label>
              <Input id="rd-end" type="time" required value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className={field} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rd-title">Name</Label>
            <Input id="rd-title" required maxLength={60} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={field} />
            <p className="text-xs text-muted-foreground">e.g. Open Practice, Race Day, Youth Day</p>
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-card p-4">
            <span>
              <span className="block font-semibold">Open online registration</span>
              <span className="block text-sm text-muted-foreground">You can turn this on later too</span>
            </span>
            <Switch checked={form.registrationOpen} onCheckedChange={(v) => setForm({ ...form, registrationOpen: v })} className="scale-125 data-[state=checked]:bg-brand" />
          </label>
          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending} className="h-12 w-full text-base font-semibold">
            {pending && <Loader2 className="animate-spin" />} {day ? "Save changes" : "Add ride day"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
