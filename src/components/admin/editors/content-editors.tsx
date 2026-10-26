"use client";

import { AreaField, BlockList, ImageField, PdfField, SaveBar, Section, StringList, TextField, ToggleField } from "@/components/admin/fields";
import { useEditor } from "@/components/admin/editors/use-editor";
import { saveContent } from "@/app/admin/actions";
import type { Content } from "@/lib/park/content";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// ---------------------------------------------------------------------------

export function SiteEditor({ initial }: { initial: Content<"site"> }) {
  const e = useEditor(initial, (v) => saveContent("site", v));
  const v = e.value;
  return (
    <div className="space-y-5">
      <Section title="Contact" hint="Shown in the header, footer, emails and anywhere riders look for you.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Phone" type="tel" value={v.phone} onChange={(phone) => e.patch({ phone })} maxLength={30} />
          <TextField label="Email" type="email" value={v.email} onChange={(email) => e.patch({ email })} hint="Rider replies and new-member notices go here." />
        </div>
      </Section>
      <Section title="Address" hint="Used for directions, the map and Google.">
        <TextField label="Street" value={v.street} onChange={(street) => e.patch({ street })} maxLength={80} />
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
          <TextField label="City" value={v.city} onChange={(city) => e.patch({ city })} maxLength={40} />
          <TextField label="State" value={v.region} onChange={(region) => e.patch({ region })} maxLength={20} />
          <TextField label="ZIP" value={v.postalCode} onChange={(postalCode) => e.patch({ postalCode })} maxLength={12} />
        </div>
        <TextField label="Directions note" value={v.directionsNote} onChange={(directionsNote) => e.patch({ directionsNote })} maxLength={120} placeholder="e.g. Just off US-131" />
      </Section>
      <Section title="Links" hint="Leave a link empty to hide it.">
        <TextField label="Facebook" type="url" value={v.facebook} onChange={(facebook) => e.patch({ facebook })} placeholder="https://www.facebook.com/…" />
        <TextField label="Instagram" type="url" value={v.instagram} onChange={(instagram) => e.patch({ instagram })} placeholder="https://www.instagram.com/…" />
        <TextField label="Merch store" type="url" value={v.storeUrl} onChange={(storeUrl) => e.patch({ storeUrl })} placeholder="https://…" />
      </Section>
      <SaveBar pending={e.pending} dirty={e.dirty} onSave={e.onSave} />
    </div>
  );
}

// ---------------------------------------------------------------------------

export function HomeEditor({ initial }: { initial: Content<"home"> }) {
  const e = useEditor(initial, (v) => saveContent("home", v));
  const v = e.value;
  return (
    <div className="space-y-5">
      <Section title="Top of the page" hint="The big photo and headline everyone sees first.">
        <ImageField label="Background photo" value={v.heroImage} folder="home" previewClass="aspect-[16/9]" onChange={(heroImage) => e.patch({ heroImage })} hint="Wide photos with dark space on the right work best." />
        <TextField label="Small line above the headline" value={v.heroEyebrow} onChange={(heroEyebrow) => e.patch({ heroEyebrow })} maxLength={80} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Headline (white)" value={v.heroLine1} onChange={(heroLine1) => e.patch({ heroLine1 })} maxLength={30} />
          <TextField label="Headline (green)" value={v.heroLine2} onChange={(heroLine2) => e.patch({ heroLine2 })} maxLength={30} />
        </div>
        <StringList label="Scrolling ticker" items={v.ticker} onChange={(ticker) => e.patch({ ticker })} max={8} maxLength={30} addLabel="Add phrase" />
        <p className="-mt-3 text-xs text-muted-foreground">Your regular hours are added to the ticker automatically.</p>
      </Section>
      <Section title="Section headlines">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Tracks headline" value={v.tracksHeading} onChange={(tracksHeading) => e.patch({ tracksHeading })} maxLength={40} />
          <TextField label="Tracks headline (outlined)" value={v.tracksAccent} onChange={(tracksAccent) => e.patch({ tracksAccent })} maxLength={40} />
          <TextField label="Gallery headline" value={v.galleryHeading} onChange={(galleryHeading) => e.patch({ galleryHeading })} maxLength={40} />
        </div>
      </Section>
      <Section title="3D map & flyover">
        <TextField label="Small line" value={v.flyoverEyebrow} onChange={(flyoverEyebrow) => e.patch({ flyoverEyebrow })} maxLength={60} />
        <TextField label="Headline" value={v.flyoverHeading} onChange={(flyoverHeading) => e.patch({ flyoverHeading })} maxLength={40} />
        <AreaField label="Text" value={v.flyoverBody} onChange={(flyoverBody) => e.patch({ flyoverBody })} maxLength={200} rows={2} />
      </Section>
      <Section title="Find us">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Headline (white)" value={v.visitHeading} onChange={(visitHeading) => e.patch({ visitHeading })} maxLength={30} />
          <TextField label="Headline (green)" value={v.visitAccent} onChange={(visitAccent) => e.patch({ visitAccent })} maxLength={30} />
        </div>
        <AreaField label="Note under the address" value={v.visitNote} onChange={(visitNote) => e.patch({ visitNote })} maxLength={240} rows={2} />
      </Section>
      <SaveBar pending={e.pending} dirty={e.dirty} onSave={e.onSave} />
    </div>
  );
}

// ---------------------------------------------------------------------------

type Track = Content<"tracks">["main"];

function TrackFields({ title, track, onChange }: { title: string; track: Track; onChange: (t: Track) => void }) {
  return (
    <Section title={title}>
      <ImageField label="Photo" value={track.image} folder="tracks" previewClass="aspect-[4/3]" onChange={(image) => onChange({ ...track, image })} />
      <TextField label="Photo description (for screen readers)" value={track.imageAlt} onChange={(imageAlt) => onChange({ ...track, imageAlt })} maxLength={140} />
      <TextField label="Name" value={track.name} onChange={(name) => onChange({ ...track, name })} maxLength={40} />
      <TextField label="Tagline" value={track.tagline} onChange={(tagline) => onChange({ ...track, tagline })} maxLength={100} />
      <div className="space-y-2">
        <Label>Three quick stats</Label>
        <div className="grid gap-3 sm:grid-cols-3">
          {track.stats.map((s, i) => (
            <div key={i} className="space-y-2 rounded-lg border bg-background/50 p-3">
              <Input value={s.value} maxLength={8} placeholder="22" onChange={(ev) => onChange({ ...track, stats: track.stats.map((x, j) => (j === i ? { ...x, value: ev.target.value } : x)) })} className="h-12 text-lg font-bold" aria-label={`Stat ${i + 1} value`} />
              <Input value={s.label} maxLength={24} placeholder="Turns" onChange={(ev) => onChange({ ...track, stats: track.stats.map((x, j) => (j === i ? { ...x, label: ev.target.value } : x)) })} className="h-11 text-base" aria-label={`Stat ${i + 1} label`} />
            </div>
          ))}
        </div>
      </div>
      <StringList label="Description paragraphs" items={track.body} onChange={(body) => onChange({ ...track, body })} max={4} maxLength={800} multiline addLabel="Add paragraph" />
    </Section>
  );
}

export function TracksEditor({ initial }: { initial: Content<"tracks"> }) {
  const e = useEditor(initial, (v) => saveContent("tracks", v));
  return (
    <div className="space-y-5">
      <TrackFields title="Main track" track={e.value.main} onChange={(main) => e.patch({ main })} />
      <TrackFields title="Junior track" track={e.value.junior} onChange={(junior) => e.patch({ junior })} />
      <SaveBar pending={e.pending} dirty={e.dirty} onSave={e.onSave} />
    </div>
  );
}

// ---------------------------------------------------------------------------

export function TrackInfoEditor({ initial }: { initial: Content<"trackInfo"> }) {
  const e = useEditor(initial, (v) => saveContent("trackInfo", v));
  const v = e.value;
  return (
    <div className="space-y-5">
      <Section title="Intro">
        <AreaField label="Text under the page title" value={v.intro} onChange={(intro) => e.patch({ intro })} maxLength={400} />
        <AreaField label="Concessions" value={v.concessions} onChange={(concessions) => e.patch({ concessions })} maxLength={300} rows={2} />
      </Section>
      <Section title="Required gear">
        <StringList label="Gear list" items={v.gear} onChange={(gear) => e.patch({ gear })} max={15} maxLength={60} addLabel="Add gear" />
        <AreaField label="Note next to the list" value={v.gearNote} onChange={(gearNote) => e.patch({ gearNote })} maxLength={300} rows={2} />
      </Section>
      <Section title="Minor riders">
        <AreaField label="Intro" value={v.minorIntro} onChange={(minorIntro) => e.patch({ minorIntro })} maxLength={300} rows={2} />
        <StringList label="Rules" items={v.minorRules} onChange={(minorRules) => e.patch({ minorRules })} max={10} maxLength={300} multiline addLabel="Add rule" />
        <TextField label="“No parent” box title" value={v.noParentTitle} onChange={(noParentTitle) => e.patch({ noParentTitle })} maxLength={60} />
        <AreaField label="“No parent” box text" value={v.noParentBody} onChange={(noParentBody) => e.patch({ noParentBody })} maxLength={500} />
      </Section>
      <Section title="House rules" hint="Shown as cards in this order.">
        <BlockList label="Rules" items={v.rules} onChange={(rules) => e.patch({ rules })} max={30} addLabel="Add rule" />
      </Section>
      <Section title="Special events">
        <BlockList label="Policies" items={v.specialEvents} onChange={(specialEvents) => e.patch({ specialEvents })} max={10} addLabel="Add policy" />
      </Section>
      <SaveBar pending={e.pending} dirty={e.dirty} onSave={e.onSave} />
    </div>
  );
}

// ---------------------------------------------------------------------------

export function WaiversEditor({ initial }: { initial: Content<"waivers"> }) {
  const e = useEditor(initial, (v) => saveContent("waivers", v));
  const items = e.value.items;
  const set = (next: typeof items) => e.setValue({ items: next });
  return (
    <div className="space-y-5">
      <Section title="Waiver downloads" hint="Riders download these from Track Info, the register page and their confirmation email.">
        <ul className="space-y-3">
          {items.map((w, i) => (
            <li key={w.id} className="space-y-3 rounded-lg border bg-background/50 p-3">
              <div className="flex gap-2">
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <Input value={w.label} maxLength={40} placeholder="Name" onChange={(ev) => set(items.map((x, j) => (j === i ? { ...x, label: ev.target.value } : x)))} className="h-12 font-semibold text-base" aria-label="Waiver name" />
                  <Input value={w.note} maxLength={40} placeholder="Note (e.g. Must be notarized)" onChange={(ev) => set(items.map((x, j) => (j === i ? { ...x, note: ev.target.value } : x)))} className="h-12 text-base" aria-label="Waiver note" />
                </div>
                <Button type="button" variant="ghost" size="icon-lg" className="size-12 text-destructive" aria-label={`Remove ${w.label}`} onClick={() => set(items.filter((_, j) => j !== i))}>
                  <X />
                </Button>
              </div>
              <PdfField value={w.href} folder="waivers" onChange={(href) => set(items.map((x, j) => (j === i ? { ...x, href } : x)))} />
            </li>
          ))}
        </ul>
        {items.length < 8 && (
          <AddWaiver onAdd={(href) => set([...items, { id: `w-${Date.now()}`, label: "New waiver", note: "", href }])} />
        )}
      </Section>
      <SaveBar pending={e.pending} dirty={e.dirty} onSave={e.onSave} />
    </div>
  );
}

function AddWaiver({ onAdd }: { onAdd: (href: string) => void }) {
  return (
    <div className="rounded-lg border border-dashed p-3">
      <p className="mb-2 text-sm font-semibold">Add a waiver</p>
      <PdfField value="" folder="waivers" onChange={onAdd} />
    </div>
  );
}

// ---------------------------------------------------------------------------

export function AnnouncementEditor({ initial }: { initial: Content<"announcement"> }) {
  const e = useEditor(initial, (v) => saveContent("announcement", v));
  const v = e.value;
  return (
    <div className="space-y-5">
      <Section title="Banner" hint="A strip across the top of every page. Great for closures, events or a new season.">
        <ToggleField label="Show the banner" hint={v.active ? "Visible on the site" : "Hidden"} checked={v.active} onChange={(active) => e.patch({ active })} />
        <div className="grid grid-cols-2 gap-2">
          {(["info", "warning"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => e.patch({ tone: t })}
              className={cn("rounded-lg border-2 p-3 text-left text-sm font-semibold", v.tone === t ? "border-ink" : "border-transparent bg-card")}
            >
              <span className={cn("mb-2 block h-3 rounded", t === "info" ? "bg-volt" : "bg-caution")} />
              {t === "info" ? "Green (news)" : "Yellow (heads up)"}
            </button>
          ))}
        </div>
        <AreaField label="Message" value={v.message} onChange={(message) => e.patch({ message })} maxLength={160} rows={2} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Link text (optional)" value={v.linkLabel} onChange={(linkLabel) => e.patch({ linkLabel })} maxLength={30} placeholder="See schedule" />
          <TextField label="Link (optional)" value={v.linkHref} onChange={(linkHref) => e.patch({ linkHref })} placeholder="/schedule or https://…" />
        </div>
        {v.message && (
          <div className={cn("rounded-md px-4 py-2 text-center text-sm font-semibold text-ink", v.tone === "warning" ? "bg-caution" : "bg-volt")}>
            Preview: {v.message}
          </div>
        )}
        {v.message && !v.active && (
          <p className="rounded-md border border-caution bg-caution/15 px-4 py-3 text-sm font-medium">
            The banner is switched off, so the site doesn&apos;t show it. Turn on <strong>Show the banner</strong> at the top, then save.
          </p>
        )}
      </Section>
      <SaveBar pending={e.pending} dirty={e.dirty} onSave={e.onSave} />
    </div>
  );
}

// ---------------------------------------------------------------------------

export function HiringEditor({ initial }: { initial: Content<"hiring"> }) {
  const e = useEditor(initial, (v) => saveContent("hiring", v));
  const v = e.value;
  return (
    <div className="space-y-5">
      <Section title="Applications" hint="Applications land in your inbox and your email.">
        <ToggleField
          label="Taking applications"
          hint={v.open ? "The form is on the Work With Us page" : "The page says you are not hiring"}
          checked={v.open}
          onChange={(open) => e.patch({ open })}
        />
        <AreaField label="Intro" value={v.intro} onChange={(intro) => e.patch({ intro })} maxLength={500} />
        <StringList label="Positions" items={v.positions} onChange={(positions) => e.patch({ positions })} max={10} maxLength={40} addLabel="Add position" />
        <StringList label="Availability choices" items={v.availability} onChange={(availability) => e.patch({ availability })} max={10} maxLength={40} addLabel="Add choice" />
      </Section>
      <SaveBar pending={e.pending} dirty={e.dirty} onSave={e.onSave} />
    </div>
  );
}

export function ContactEditor({ initial }: { initial: Content<"contact"> }) {
  const e = useEditor(initial, (v) => saveContent("contact", v));
  return (
    <div className="space-y-5">
      <Section title="Contact page" hint="Messages land in your inbox and your email. Phone and email come from Contact & links.">
        <AreaField label="Intro" value={e.value.intro} onChange={(intro) => e.patch({ intro })} maxLength={300} />
      </Section>
      <SaveBar pending={e.pending} dirty={e.dirty} onSave={e.onSave} />
    </div>
  );
}
