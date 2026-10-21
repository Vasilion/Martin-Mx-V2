import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { getContent } from "@/lib/park/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Gallery",
  description: "Photos from the main and junior tracks at Martin MX Park.",
  path: "/gallery",
  og: "gallery",
});

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const { items } = await getContent("gallery");
  return (
    <>
      <PageHeader compact eyebrow="From the track" title="Roost" accent="& repeat." image="/photos/rider-red.jpg" imagePosition="center 45%" />
      <section className="bg-ink pb-24 pt-10 md:pb-32">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          {items.length ? <GalleryGrid photos={items} /> : <p className="text-white/60">Photos coming soon.</p>}
        </div>
      </section>
    </>
  );
}
