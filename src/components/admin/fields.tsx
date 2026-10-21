"use client";

/* eslint-disable @next/next/no-img-element -- previews of arbitrary uploaded images */
import { useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileText, ImageUp, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { resizeImage, uploadBlob } from "@/components/admin/upload";

/** Shared building blocks for every content editor. Large tap targets, 16px text (no iOS zoom). */

export function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-4 md:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  maxLength,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  maxLength?: number;
  type?: string;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-12 text-base" />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function AreaField({ label, value, onChange, hint, maxLength, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; hint?: string; maxLength?: number; rows?: number }) {
  const id = useId();
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {maxLength && <span className="text-xs tabular-nums text-muted-foreground">{value.length}/{maxLength}</span>}
      </div>
      <Textarea id={id} value={value} maxLength={maxLength} rows={rows} onChange={(e) => onChange(e.target.value)} className="text-base" />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ToggleField({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4">
      <span>
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-sm text-muted-foreground">{hint}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} className="scale-125 data-[state=checked]:bg-brand" />
    </label>
  );
}

function move<T>(list: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function RowTools({ i, count, onMove, onRemove, label }: { i: number; count: number; onMove: (dir: -1 | 1) => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex shrink-0 gap-1">
      <Button type="button" variant="ghost" size="icon-lg" className="size-10" disabled={i === 0} onClick={() => onMove(-1)} aria-label={`Move ${label} up`}>
        <ArrowUp />
      </Button>
      <Button type="button" variant="ghost" size="icon-lg" className="size-10" disabled={i === count - 1} onClick={() => onMove(1)} aria-label={`Move ${label} down`}>
        <ArrowDown />
      </Button>
      <Button type="button" variant="ghost" size="icon-lg" className="size-10 text-destructive" onClick={onRemove} aria-label={`Remove ${label}`}>
        <X />
      </Button>
    </div>
  );
}

/** Ordered list of short strings (gear, perks, rules...). */
export function StringList({ label, items, onChange, max = 20, maxLength = 200, addLabel = "Add", multiline = false }: { label: string; items: string[]; onChange: (v: string[]) => void; max?: number; maxLength?: number; addLabel?: string; multiline?: boolean }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            {multiline ? (
              <Textarea value={item} maxLength={maxLength} rows={2} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} className="text-base" aria-label={`${label} ${i + 1}`} />
            ) : (
              <Input value={item} maxLength={maxLength} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} className="h-12 text-base" aria-label={`${label} ${i + 1}`} />
            )}
            <RowTools i={i} count={items.length} label={`item ${i + 1}`} onMove={(d) => onChange(move(items, i, d))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
          </li>
        ))}
      </ul>
      {items.length < max && (
        <Button type="button" variant="outline" className="h-11" onClick={() => onChange([...items, ""])}>
          <Plus /> {addLabel}
        </Button>
      )}
    </div>
  );
}

/** Ordered list of { title, body } (house rules, special-event policies). */
export function BlockList({ label, items, onChange, max = 30, addLabel = "Add" }: { label: string; items: { title: string; body: string }[]; onChange: (v: { title: string; body: string }[]) => void; max?: number; addLabel?: string }) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="space-y-2 rounded-lg border bg-background/50 p-3">
            <div className="flex items-start gap-2">
              <Input value={item.title} maxLength={80} placeholder="Title" onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} className="h-12 font-semibold text-base" aria-label={`Title ${i + 1}`} />
              <RowTools i={i} count={items.length} label={item.title || `item ${i + 1}`} onMove={(d) => onChange(move(items, i, d))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
            </div>
            <Textarea value={item.body} maxLength={600} rows={3} placeholder="Details" onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} className="text-base" aria-label={`Details ${i + 1}`} />
          </li>
        ))}
      </ul>
      {items.length < max && (
        <Button type="button" variant="outline" className="h-11" onClick={() => onChange([...items, { title: "", body: "" }])}>
          <Plus /> {addLabel}
        </Button>
      )}
    </div>
  );
}

/** Pick a photo (camera roll or camera), shrink it on the phone, upload to S3. */
export function ImageField({
  label,
  value,
  onChange,
  folder,
  hint,
  maxEdge = 2000,
  previewClass = "aspect-[16/9]",
  contain = false,
}: {
  label: string;
  value: string;
  onChange: (url: string, size: { width: number; height: number }) => void;
  folder: string;
  hint?: string;
  maxEdge?: number;
  previewClass?: string;
  contain?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const { blob, width, height } = await resizeImage(file, maxEdge);
      const url = await uploadBlob(blob, folder, "image");
      onChange(url, { width, height });
      toast.success("Photo uploaded. Save to publish it.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className={cn("group relative block w-full overflow-hidden rounded-lg border bg-muted", previewClass, contain && "bg-white")}
      >
        {value ? (
          <img src={value} alt="" className={cn("absolute inset-0 h-full w-full", contain ? "object-contain p-4" : "object-cover")} />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-muted-foreground">No image</span>
        )}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-ink/75 py-3 text-sm font-semibold text-white">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
          {busy ? "Uploading…" : value ? "Replace photo" : "Upload photo"}
        </span>
      </button>
      <input ref={input} type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} tabIndex={-1} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Upload a PDF (waivers). */
export function PdfField({ value, onChange, folder }: { value: string; onChange: (url: string) => void; folder: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function pick(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") return toast.error("Pick a PDF file.");
    setBusy(true);
    try {
      onChange(await uploadBlob(file, folder, "pdf"));
      toast.success("PDF uploaded. Save to publish it.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={value} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-2 rounded-md border bg-background/50 px-3 py-2.5 text-sm">
        <FileText className="size-4 shrink-0 text-brand" /> <span className="truncate">{value.split("/").pop()}</span>
      </a>
      <Button type="button" variant="outline" className="h-11" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? <Loader2 className="animate-spin" /> : <FileText />} Replace PDF
      </Button>
      <input ref={input} type="file" accept="application/pdf" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} tabIndex={-1} />
    </div>
  );
}

/** Sticky save bar that sits above the phone tab bar. */
export function SaveBar({ pending, dirty, onSave }: { pending: boolean; dirty: boolean; onSave: () => void }) {
  return (
    <div className="sticky bottom-20 z-30 rounded-lg border bg-card/95 p-3 shadow-lg backdrop-blur lg:bottom-4">
      <Button type="button" onClick={onSave} disabled={pending || !dirty} className="h-12 w-full text-base font-semibold">
        {pending && <Loader2 className="animate-spin" />} {dirty ? "Save changes" : "All changes saved"}
      </Button>
    </div>
  );
}
