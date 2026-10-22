"use client";

import { useState, useTransition } from "react";
import { Ban, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { setCancelled, setRegistrationOpen, type ActionState } from "@/app/admin/actions";
import type { RideDay } from "@/lib/park/live";

const quickReasons = ["Rain", "Track conditions", "Storms in the forecast", "Too cold"];

function report(res: ActionState) {
  if (res.error) toast.error(res.error);
  else if (res.message) toast.success(res.message);
}

/** The two decisions owners make most: is practice on, and is online registration open. */
export function DayControls({ day, compact = false, registered = 0 }: { day: RideDay; compact?: boolean; registered?: number }) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);

  const run = (fn: () => Promise<ActionState>) => start(async () => report(await fn()));

  return (
    <div className={cn("grid gap-3", !compact && "sm:grid-cols-2")}>
      {/* Practice on / cancelled */}
      {day.cancelled ? (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/8 p-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-semibold text-destructive">
              <Ban className="size-5 shrink-0" aria-hidden /> Cancelled
            </p>
            {day.cancelReason && <p className="mt-0.5 truncate text-sm text-muted-foreground">{day.cancelReason}</p>}
          </div>
          <Button variant="outline" className="h-11 shrink-0 bg-card" disabled={pending} onClick={() => run(() => setCancelled(day.date, false))}>
            {pending ? <Loader2 className="animate-spin" /> : <RotateCcw />} Turn back on
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4">
          <p className="flex items-center gap-2 font-semibold text-brand">
            <CheckCircle2 className="size-5" aria-hidden /> Practice is on
          </p>
          <Button variant="destructive" className="h-11 shrink-0" disabled={pending} onClick={() => setOpen(true)}>
            <Ban /> Cancel
          </Button>
        </div>
      )}

      {/* Online registration */}
      <label
        className={cn(
          "flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-card p-4",
          day.cancelled && "pointer-events-none opacity-50",
        )}
      >
        <span>
          <span className="block font-semibold">Online registration</span>
          <span className="block text-sm text-muted-foreground">
            {day.registrationOpen ? "Riders can sign up and pay" : "Form is hidden on the site"}
          </span>
        </span>
        <Switch
          checked={day.registrationOpen}
          disabled={pending || day.cancelled}
          onCheckedChange={(v) => run(() => setRegistrationOpen(day.date, v))}
          className="scale-125 data-[state=checked]:bg-brand"
          aria-label="Online registration"
        />
      </label>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="theme-admin max-w-md">
          <DialogTitle>Cancel practice?</DialogTitle>
          <DialogDescription>
            The site shows it as cancelled right away. Refunds aren&apos;t automatic: issue them in Stripe if you want to.
          </DialogDescription>
          <div className="flex flex-wrap gap-2">
            {quickReasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-sm font-medium transition",
                  reason === r ? "border-brand bg-brand text-white" : "bg-card hover:border-foreground/30",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={140}
            placeholder="Reason riders will see (optional)"
            className="min-h-20 text-base"
          />
          {registered > 0 && (
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3">
              <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="mt-1 size-5 accent-[var(--brand)]" />
              <span>
                <span className="block font-semibold">Email the {registered} rider{registered === 1 ? "" : "s"} who registered</span>
                <span className="block text-sm text-muted-foreground">They get a cancellation notice with your reason and your phone number.</span>
              </span>
            </label>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" className="h-11" onClick={() => setOpen(false)}>
              Keep it on
            </Button>
            <Button
              variant="destructive"
              className="h-11"
              disabled={pending}
              onClick={() =>
                run(async () => {
                  const res = await setCancelled(day.date, true, reason, registered > 0 && notify);
                  if (!res.error) {
                    setOpen(false);
                    setReason("");
                  }
                  return res;
                })
              }
            >
              {pending && <Loader2 className="animate-spin" />} Cancel practice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
