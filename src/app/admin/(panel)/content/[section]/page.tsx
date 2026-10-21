import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { getContent } from "@/lib/park/content";
import { getAllSponsors } from "@/lib/park/live";
import { editSections } from "@/lib/admin/sections";
import {
  AnnouncementEditor,
  HomeEditor,
  SiteEditor,
  TrackInfoEditor,
  TracksEditor,
  WaiversEditor,
} from "@/components/admin/editors/content-editors";
import { GalleryEditor, SponsorsEditor } from "@/components/admin/editors/media-editors";

const preview: Record<string, string> = {
  home: "/",
  tracks: "/#tracks",
  trackInfo: "/track-info",
  waivers: "/track-info#waivers",
  gallery: "/gallery",
  sponsors: "/sponsors",
  announcement: "/",
  site: "/",
};

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  return { title: editSections.find((s) => s.href.endsWith(`/${section}`))?.title ?? "Edit" };
}

async function editorFor(section: string) {
  switch (section) {
    case "site":
      return <SiteEditor initial={await getContent("site")} />;
    case "home":
      return <HomeEditor initial={await getContent("home")} />;
    case "tracks":
      return <TracksEditor initial={await getContent("tracks")} />;
    case "trackInfo":
      return <TrackInfoEditor initial={await getContent("trackInfo")} />;
    case "waivers":
      return <WaiversEditor initial={await getContent("waivers")} />;
    case "announcement":
      return <AnnouncementEditor initial={await getContent("announcement")} />;
    case "gallery":
      return <GalleryEditor initial={await getContent("gallery")} />;
    case "sponsors":
      return <SponsorsEditor initial={await getAllSponsors()} />;
    default:
      return null;
  }
}

export default async function ContentPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const meta = editSections.find((s) => s.href.endsWith(`/${section}`));
  const editor = await editorFor(section);
  if (!meta || !editor) notFound();
  return (
    <div className="mx-auto max-w-3xl space-y-5 xl:max-w-4xl">
      <Link href="/admin/more" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> All sections
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{meta.title}</h1>
          <p className="mt-1 text-muted-foreground">{meta.desc}</p>
        </div>
        <a href={preview[section] ?? "/"} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
          View on site <ExternalLink className="size-4" />
        </a>
      </header>
      {editor}
    </div>
  );
}
