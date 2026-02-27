import { getGalleryItems } from "@/lib/content/loader";
import { InteractiveGallery } from "@/components/interactive-gallery";

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <section className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <h1 className="text-3xl font-bold md:text-4xl">Gallery</h1>
        <p className="mt-2 text-sm text-zinc-300 md:text-base">
          Recent visuals from Martin MX sessions and rider activity.
        </p>
      </header>
      <InteractiveGallery items={items} />
    </section>
  );
}
