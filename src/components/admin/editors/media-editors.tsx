"use client";

/* eslint-disable @next/next/no-img-element -- previews of uploaded images */
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageField, SaveBar, Section, TextField, ToggleField } from "@/components/admin/fields";
import { useEditor } from "@/components/admin/editors/use-editor";
import { resizeImage, uploadBlob } from "@/components/admin/upload";
import { saveContent, saveSponsors } from "@/app/admin/actions";
import type { Content } from "@/lib/park/content";
import type { Sponsor } from "@/lib/park/live";

function move<T>(list: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

// ---------------------------------------------------------------------------

export function SponsorsEditor({ initial }: { initial: Sponsor[] }) {
  const e = useEditor(initial, saveSponsors);
  const list = e.value;
  const set = (i: number, p: Partial<Sponsor>) => e.setValue(list.map((s, j) => (j === i ? { ...s, ...p } : s)));
  return (
    <div className="space-y-4">
      {list.map((s, i) => (
        <Section key={s.id} title={s.name || "New sponsor"}>
          <div className="grid gap-5 md:grid-cols-[220px_1fr]">
            <ImageField label="Logo" value={s.logo} folder="sponsors" maxEdge={800} contain previewClass="aspect-[3/2]" onChange={(logo) => set(i, { logo })} />
            <div className="space-y-4">
              <TextField label="Name" value={s.name} onChange={(name) => set(i, { name })} maxLength={80} />
              <TextField label="Website or Facebook link" type="url" value={s.href} onChange={(href) => set(i, { href })} placeholder="https://…" />
              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleField label="Show on site" checked={s.active} onChange={(active) => set(i, { active })} />
                <ToggleField label="Title sponsor" hint="Big spot on the sponsors page" checked={s.title} onChange={(title) => set(i, { title })} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button type="button" variant="outline" className="h-10" disabled={i === 0} onClick={() => e.setValue(move(list, i, -1))}>
              <ArrowUp /> Up
            </Button>
            <Button type="button" variant="outline" className="h-10" disabled={i === list.length - 1} onClick={() => e.setValue(move(list, i, 1))}>
              <ArrowDown /> Down
            </Button>
            <Button type="button" variant="outline" className="ml-auto h-10 text-destructive" onClick={() => e.setValue(list.filter((_, j) => j !== i))}>
              <Trash2 /> Remove
            </Button>
          </div>
        </Section>
      ))}
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full border-dashed bg-card text-base"
        onClick={() => e.setValue([...list, { id: `sp-${Date.now()}`, name: "", href: "", logo: "", title: false, active: true }])}
      >
        <Plus /> Add a sponsor
      </Button>
      <SaveBar pending={e.pending} dirty={e.dirty} onSave={e.onSave} />
    </div>
  );
}

// ---------------------------------------------------------------------------

type Photo = Content<"gallery">["items"][number];

export function GalleryEditor({ initial }: { initial: Content<"gallery"> }) {
  const e = useEditor(initial, (v) => saveContent("gallery", v));
  const items = e.value.items;
  const setItems = (next: Photo[] | ((prev: Photo[]) => Photo[])) =>
    e.setValue((v) => ({ items: typeof next === "function" ? next(v.items) : next }));
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 40);
    setProgress({ done: 0, total: list.length });
    let failed = 0;
    for (const file of list) {
      try {
        const { blob, width, height } = await resizeImage(file, 2000);
        const src = await uploadBlob(blob, "gallery", "image");
        // New photos go first so they're easy to find (and featured on the home page).
        setItems((prev) => [{ id: `g-${crypto.randomUUID()}`, src, alt: "", width, height, featured: true }, ...prev]);
      } catch {
        failed++;
      }
      setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
    }
    setProgress(null);
    if (input.current) input.current.value = "";
    if (failed) toast.error(`${failed} photo${failed > 1 ? "s" : ""} couldn't upload.`);
    else toast.success("Photos added. Save to publish them.");
  }

  const featured = items.filter((p) => p.featured).length;

  return (
    <div className="space-y-4">
      <Section title="Photos" hint={`${items.length} photos · ${featured} starred. Every photo shows on the Gallery page; starred ones (yellow star) also show in the home page photo strip, first 10. Tap a star to turn it on or off.`}>
        <Button type="button" className="h-12 w-full text-base sm:w-auto" disabled={!!progress} onClick={() => input.current?.click()}>
          {progress ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {progress ? `Uploading ${progress.done + 1} of ${progress.total}…` : "Add photos"}
        </Button>
        <input ref={input} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} onChange={(ev) => addPhotos(ev.target.files)} />

        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {items.map((p, i) => (
            <li key={p.id} className="overflow-hidden rounded-lg border bg-background/50">
              <div className="relative aspect-square bg-muted">
                <img src={p.src} alt={p.alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                <button
                  type="button"
                  onClick={() => setItems(items.map((x, j) => (j === i ? { ...x, featured: !x.featured } : x)))}
                  aria-pressed={p.featured}
                  aria-label={p.featured ? "Remove from home page" : "Show on home page"}
                  className={cn("absolute right-2 top-2 grid size-10 place-items-center rounded-full shadow", p.featured ? "bg-caution text-ink" : "bg-white/90 text-black/40")}
                >
                  <Star className="size-5" fill={p.featured ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="space-y-2 p-2">
                <Input value={p.alt} maxLength={160} placeholder="Describe the photo" onChange={(ev) => setItems(items.map((x, j) => (j === i ? { ...x, alt: ev.target.value } : x)))} className="h-10 text-sm" aria-label="Photo description" />
                <div className="flex justify-between">
                  <div className="flex">
                    <Button type="button" variant="ghost" size="icon-lg" className="size-9" disabled={i === 0} onClick={() => setItems(move(items, i, -1))} aria-label="Move earlier">
                      <ArrowUp />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-lg" className="size-9" disabled={i === items.length - 1} onClick={() => setItems(move(items, i, 1))} aria-label="Move later">
                      <ArrowDown />
                    </Button>
                  </div>
                  <Button type="button" variant="ghost" className="h-9 px-2 text-destructive" onClick={() => setItems(items.filter((_, j) => j !== i))}>
                    <Trash2 /> Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>
      <SaveBar pending={e.pending} dirty={e.dirty} onSave={e.onSave} />
    </div>
  );
}
