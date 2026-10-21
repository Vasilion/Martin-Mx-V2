"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Archive, ArchiveRestore, ChevronDown, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { setInboxState } from "@/app/admin/actions";
import type { InboxItem } from "@/lib/inbox/store";

function when(iso: string) {
  return new Date(iso).toLocaleString("en-US", { timeZone: "America/Detroit", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function InboxList({ items, emptyText }: { items: InboxItem[]; emptyText: string }) {
  const [showArchived, setShowArchived] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [, start] = useTransition();
  const [list, apply] = useOptimistic(items, (state, p: { id: string; read?: boolean; archived?: boolean }) =>
    state.map((i) => (i.id === p.id ? { ...i, ...p } : i)),
  );

  const update = (id: string, patch: { read?: boolean; archived?: boolean }) =>
    start(async () => {
      apply({ id, ...patch });
      await setInboxState(id, patch);
    });

  const shown = list.filter((i) => i.archived === showArchived);
  const archivedCount = list.filter((i) => i.archived).length;

  return (
    <div className="space-y-3">
      {shown.length === 0 && (
        <div className="rounded-lg border border-dashed bg-card p-8 text-center text-muted-foreground">{showArchived ? "Nothing archived." : emptyText}</div>
      )}
      <ul className="space-y-2">
        {shown.map((i) => {
          const open = openId === i.id;
          const summary = i.fields[0]?.value ?? "";
          return (
            <li key={i.id} className="overflow-hidden rounded-lg border bg-card">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => {
                  setOpenId(open ? null : i.id);
                  if (!open && !i.read) update(i.id, { read: true });
                }}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className={cn("size-2.5 shrink-0 rounded-full", i.read ? "bg-transparent" : "bg-brand")} aria-label={i.read ? undefined : "Unread"} />
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate", !i.read && "font-bold")}>{i.name}</span>
                  <span className="block truncate text-sm text-muted-foreground">{summary}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{when(i.createdAt)}</span>
                <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
              </button>
              {open && (
                <div className="space-y-4 border-t bg-background/50 p-4">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild className="h-11">
                      <a href={`mailto:${i.email}?subject=${encodeURIComponent(i.kind === "application" ? "Your Martin MX application" : "Re: your message to Martin MX")}`}>
                        <Mail /> Email
                      </a>
                    </Button>
                    {i.phone && (
                      <Button asChild variant="outline" className="h-11 bg-card">
                        <a href={`tel:${i.phone}`}>
                          <Phone /> Call
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" className="ml-auto h-11 bg-card" onClick={() => update(i.id, { archived: !i.archived })}>
                      {i.archived ? <ArchiveRestore /> : <Archive />} {i.archived ? "Restore" : "Archive"}
                    </Button>
                  </div>
                  <dl className="divide-y rounded-md border bg-card text-sm">
                    {[{ label: "Email", value: i.email }, ...(i.phone ? [{ label: "Phone", value: i.phone }] : []), ...i.fields].map((f, k) =>
                      f.value ? (
                        <div key={k} className="grid gap-1 px-3 py-2.5 sm:grid-cols-[200px_1fr]">
                          <dt className="text-muted-foreground">{f.label}</dt>
                          <dd className="whitespace-pre-wrap break-words font-medium">{f.value}</dd>
                        </div>
                      ) : null,
                    )}
                  </dl>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {(archivedCount > 0 || showArchived) && (
        <button type="button" className="text-sm font-semibold text-muted-foreground" onClick={() => setShowArchived((v) => !v)}>
          {showArchived ? "← Back to inbox" : `Archived (${archivedCount})`}
        </button>
      )}
    </div>
  );
}
