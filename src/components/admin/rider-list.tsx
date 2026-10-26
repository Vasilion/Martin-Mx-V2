"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { Check, ExternalLink, Loader2, Mail, MoreHorizontal, Phone, Search, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { removeRider, setCheckedIn } from "@/app/admin/actions";
import type { ClassCount, RosterRider } from "@/lib/admin/roster";

/** Gate list: search, filter by class, one tap to check a rider in, "…" for details and removal. */
export function RiderList({ riders, classes }: { riders: RosterRider[]; classes: ClassCount[] }) {
  const [query, setQuery] = useState("");
  const [cls, setCls] = useState<string | null>(null);
  const [, start] = useTransition();
  const [detail, setDetail] = useState<RosterRider | null>(null);
  const [optimistic, setOptimistic] = useOptimistic(riders, (state, { id, checkedIn }: { id: string; checkedIn: boolean }) =>
    state.map((r) => (r.id === id ? { ...r, checkedIn } : r)),
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return optimistic.filter(
      (r) => (!cls || r.classId === cls) && (!q || r.name.toLowerCase().includes(q) || r.riderNumber.includes(q)),
    );
  }, [optimistic, query, cls]);

  const toggle = (r: RosterRider) =>
    start(async () => {
      setOptimistic({ id: r.id, checkedIn: !r.checkedIn });
      const res = await setCheckedIn(r.id, !r.checkedIn);
      if (res.error) toast.error(res.error);
    });

  if (riders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-8 text-center">
        <p className="font-semibold">No online registrations yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Paid sign-ups show up here the moment they come in.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or number"
          inputMode="search"
          className="h-12 bg-card pl-11 text-base"
          aria-label="Search riders"
        />
      </div>
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
        {[{ id: null, label: "All", paid: riders.length }, ...classes].map((c) => (
          <button
            key={c.id ?? "all"}
            type="button"
            onClick={() => setCls(c.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition",
              cls === c.id ? "border-ink bg-ink text-white" : "bg-card",
            )}
          >
            {c.label} <span className="opacity-60">{c.paid}</span>
          </button>
        ))}
      </div>

      <ul className="mt-3 divide-y overflow-hidden rounded-lg border bg-card">
        {shown.map((r) => (
          <li key={r.id} className={cn("flex items-center transition", r.checkedIn && "bg-brand/8")}>
            <button
              type="button"
              onClick={() => toggle(r)}
              aria-pressed={r.checkedIn}
              className={cn("flex min-w-0 flex-1 items-center gap-3 py-3.5 pl-3 text-left sm:gap-4 sm:pl-4", !r.checkedIn && "active:bg-muted")}
            >
              <span className="min-w-10 shrink-0 whitespace-nowrap text-center font-display text-xl font-bold italic tabular-nums sm:min-w-12 sm:text-2xl">{r.riderNumber}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-semibold leading-snug [overflow-wrap:anywhere]">{r.name}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                  {r.classLabel} · {r.bikeSize}cc
                  {r.ageGroup === "minor" && (
                    <span className="rounded bg-caution/25 px-1.5 py-0.5 text-[11px] font-bold uppercase text-[#7a4b00]">Minor</span>
                  )}
                </span>
              </span>
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-full border-2 transition sm:size-11",
                  r.checkedIn ? "border-brand bg-brand text-white" : "border-black/20 text-transparent",
                )}
                aria-hidden
              >
                <Check className="size-6" strokeWidth={3} />
              </span>
              <span className="sr-only">{r.checkedIn ? "Checked in" : "Not checked in"}</span>
            </button>
            <button
              type="button"
              onClick={() => setDetail(r)}
              className="grid h-14 w-11 shrink-0 place-items-center text-muted-foreground active:bg-muted"
              aria-label={`Details for ${r.name}`}
            >
              <MoreHorizontal className="size-5" />
            </button>
          </li>
        ))}
        {shown.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">No riders match.</li>}
      </ul>
      <RiderDetails rider={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function RiderDetails({ rider: r, onClose }: { rider: RosterRider | null; onClose: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const close = () => {
    setConfirming(false);
    onClose();
  };
  const remove = (id: string) =>
    start(async () => {
      const res = await removeRider(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.message);
        close();
      }
    });

  return (
    <Dialog open={!!r} onOpenChange={(o) => !o && close()}>
      {r && (
        <DialogContent className="theme-admin max-w-md">
          <DialogTitle className="pr-8 text-lg">
            #{r.riderNumber} {r.name}
          </DialogTitle>
          <DialogDescription>
            {r.classLabel} · {r.bikeSize}cc · {r.ageGroup === "minor" ? "Minor" : "Adult"} · paid ${r.amount}
          </DialogDescription>
          <div className="grid gap-2">
            <a href={`tel:${r.phone}`} className="flex items-center gap-3 rounded-lg border bg-card p-3 font-medium">
              <Phone className="size-5 shrink-0 text-muted-foreground" aria-hidden /> {r.phone}
            </a>
            <a href={`mailto:${r.email}`} className="flex min-w-0 items-center gap-3 rounded-lg border bg-card p-3 font-medium">
              <Mail className="size-5 shrink-0 text-muted-foreground" aria-hidden /> <span className="min-w-0 [overflow-wrap:anywhere]">{r.email}</span>
            </a>
          </div>
          {confirming ? (
            <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/8 p-3">
              <p className="text-sm">
                <strong>Take {r.name} off the list?</strong> Their spot opens up for someone else. This doesn&apos;t refund them: use{" "}
                <strong>Refund in Stripe</strong> for that.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="h-11 flex-1 bg-card" onClick={() => setConfirming(false)}>
                  Keep them
                </Button>
                <Button variant="destructive" className="h-11 flex-1" disabled={pending} onClick={() => remove(r.id)}>
                  {pending ? <Loader2 className="animate-spin" /> : <UserMinus />} Remove
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Rider cancelling? Refund them in Stripe and they come off this list on their own. To take them off without a refund, tap Remove from list.
            </p>
          )}
          {!confirming && (
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" className="h-11 text-destructive" onClick={() => setConfirming(true)}>
                <UserMinus /> Remove from list
              </Button>
              <Button asChild variant="outline" className="h-11">
                <a href={r.stripeUrl} target="_blank" rel="noreferrer">
                  <ExternalLink /> Refund in Stripe
                </a>
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
