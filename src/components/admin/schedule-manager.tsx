"use client";

import { useEffect, useState, useTransition } from "react";
import { Ban, CalendarPlus, ChevronDown, Loader2, Pencil, Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { RideDayForm } from "@/components/admin/ride-day-form";
import { DayControls } from "@/components/admin/day-controls";
import { deleteRideDay, fillRegularWeeks } from "@/app/admin/actions";
import type { RideDay } from "@/lib/park/live";
import { formatTimeRange, monthDay, weekdayOf } from "@/lib/park/format";

function useSheetSide() {
  const [side, setSide] = useState<"bottom" | "right">("bottom");
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setSide(mq.matches ? "right" : "bottom");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return side;
}

export function ScheduleManager({
  upcoming,
  past,
  today,
  registered,
  defaults,
  startOpen,
  registrationEnabled,
}: {
  upcoming: RideDay[];
  past: RideDay[];
  today: string;
  registered: Record<string, number>;
  defaults: { start: string; end: string };
  startOpen: boolean;
  registrationEnabled: boolean;
}) {
  const side = useSheetSide();
  const [editing, setEditing] = useState<RideDay | undefined>();
  const [formOpen, setFormOpen] = useState(startOpen);
  const [expanded, setExpanded] = useState<string | null>(upcoming[0]?.date ?? null);
  const [confirmDelete, setConfirmDelete] = useState<RideDay | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [pending, start] = useTransition();

  const openNew = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button className="h-12 flex-1 px-5 text-base sm:flex-none" onClick={openNew}>
          <CalendarPlus /> Add ride day
        </Button>
        <Button
          variant="outline"
          className="h-12 flex-1 bg-card px-5 text-base sm:flex-none"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await fillRegularWeeks(4);
              if (res.error) toast.error(res.error);
              else toast.success(res.message);
            })
          }
        >
          {pending ? <Loader2 className="animate-spin" /> : <Repeat />} Fill next 4 weeks
        </Button>
      </div>
      <p className="-mt-3 text-sm text-muted-foreground">&ldquo;Fill next 4 weeks&rdquo; adds your regular hours from Settings and skips days already on the schedule.</p>

      {upcoming.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">No upcoming ride days.</div>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((d) => {
            const { month, day } = monthDay(d.date);
            const isOpen = expanded === d.date;
            const count = registered[d.date] ?? 0;
            return (
              <li key={d.date} className="overflow-hidden rounded-lg border bg-card">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : d.date)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 p-4 text-left"
                >
                  <span className="flex w-12 shrink-0 flex-col items-center leading-none">
                    <span className="text-xs font-bold uppercase text-muted-foreground">{month}</span>
                    <span className={cn("mt-1 font-display text-3xl font-bold italic", d.cancelled && "text-muted-foreground line-through")}>{day}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{weekdayOf(d.date, "long")}</span>
                      {d.date === today && <span className="rounded bg-ink px-1.5 py-0.5 text-[11px] font-bold uppercase text-white">Today</span>}
                      {d.cancelled && (
                        <span className="flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.5 text-[11px] font-bold uppercase text-destructive">
                          <Ban className="size-3" /> Cancelled
                        </span>
                      )}
                      {!d.cancelled && d.registrationOpen && registrationEnabled && (
                        <span className="rounded bg-brand/12 px-1.5 py-0.5 text-[11px] font-bold uppercase text-brand">Reg open</span>
                      )}
                      {!d.cancelled && !(d.registrationOpen && registrationEnabled) && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold uppercase text-muted-foreground">Cash only</span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                      {d.title} · {formatTimeRange(d.start, d.end)}
                      {count > 0 && ` · ${count} registered`}
                    </span>
                  </span>
                  <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} aria-hidden />
                </button>
                {isOpen && (
                  <div className="space-y-3 border-t bg-background/60 p-4">
                    <DayControls day={d} compact registered={count} registrationEnabled={registrationEnabled} />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="h-11 flex-1 bg-card"
                        onClick={() => {
                          setEditing(d);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil /> Edit
                      </Button>
                      <Button variant="outline" className="h-11 flex-1 bg-card text-destructive" onClick={() => setConfirmDelete(d)}>
                        <Trash2 /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {past.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowPast((v) => !v)} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <ChevronDown className={cn("size-4 transition-transform", showPast && "rotate-180")} /> Past ride days ({past.length})
          </button>
          {showPast && (
            <ul className="mt-3 divide-y rounded-lg border bg-card text-sm">
              {past.map((d) => (
                <li key={d.date} className="flex justify-between gap-4 px-4 py-3">
                  <span>
                    {weekdayOf(d.date)} {monthDay(d.date).month} {monthDay(d.date).day} · {d.title}
                    {d.cancelled && <span className="text-destructive"> · cancelled</span>}
                  </span>
                  <span className="text-muted-foreground">{registered[d.date] ?? 0} riders</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Remount per target so the form starts from the right values. */}
      <RideDayForm key={editing?.date ?? "new"} open={formOpen} onOpenChange={setFormOpen} day={editing} defaults={defaults} side={side} />

      <Dialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <DialogContent className="theme-admin max-w-sm">
          <DialogTitle>Delete this ride day?</DialogTitle>
          <DialogDescription>
            It disappears from the site. If riders are registered you&apos;ll need to cancel it instead, so they can see what happened.
          </DialogDescription>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" className="h-11" onClick={() => setConfirmDelete(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              className="h-11"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await deleteRideDay(confirmDelete!.date);
                  if (res.error) toast.error(res.error);
                  else toast.success(res.message);
                  setConfirmDelete(null);
                })
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
