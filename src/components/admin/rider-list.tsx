"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { Check, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { setCheckedIn } from "@/app/admin/actions";
import type { ClassCount, RosterRider } from "@/lib/admin/roster";

/** Gate list: search, filter by class, one tap to check a rider in. */
export function RiderList({ riders, classes }: { riders: RosterRider[]; classes: ClassCount[] }) {
  const [query, setQuery] = useState("");
  const [cls, setCls] = useState<string | null>(null);
  const [, start] = useTransition();
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
          <li key={r.id}>
            <button
              type="button"
              onClick={() => toggle(r)}
              aria-pressed={r.checkedIn}
              className={cn("flex w-full items-center gap-4 px-4 py-3.5 text-left transition", r.checkedIn ? "bg-brand/8" : "active:bg-muted")}
            >
              <span className="w-12 shrink-0 text-center font-display text-2xl font-bold italic tabular-nums">{r.riderNumber}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[16px] font-semibold">{r.name}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                  {r.classLabel} · {r.bikeSize}cc
                  {r.ageGroup === "minor" && (
                    <span className="rounded bg-caution/25 px-1.5 py-0.5 text-[11px] font-bold uppercase text-[#7a4b00]">Minor</span>
                  )}
                </span>
              </span>
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-full border-2 transition",
                  r.checkedIn ? "border-brand bg-brand text-white" : "border-black/20 text-transparent",
                )}
                aria-hidden
              >
                <Check className="size-6" strokeWidth={3} />
              </span>
              <span className="sr-only">{r.checkedIn ? "Checked in" : "Not checked in"}</span>
            </button>
          </li>
        ))}
        {shown.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">No riders match.</li>}
      </ul>
    </div>
  );
}
