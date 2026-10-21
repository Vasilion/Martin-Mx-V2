import type { Metadata } from "next";
import { park } from "@/lib/park/facts";

/**
 * Full per-page metadata. Next replaces (doesn't merge) openGraph/twitter objects
 * from the layout, so every page sets the complete set, including its share card.
 */
export function pageMetadata({
  title,
  description,
  path,
  og,
}: {
  /** Omit for the home page to use the layout's default title. */
  title?: string;
  description: string;
  path: string;
  /** Slug of a card in public/og/ (see scripts/generate-brand-assets.mjs). */
  og: string;
}): Metadata {
  const shareTitle = title ? `${title} | ${park.name}` : park.name;
  const image = { url: `/og/${og}.jpg`, width: 1200, height: 630, alt: shareTitle };
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      title: shareTitle,
      description,
      url: path,
      siteName: park.name,
      locale: "en_US",
      type: "website",
      images: [image],
    },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: [image.url] },
  };
}
