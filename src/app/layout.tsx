import type { Metadata, Viewport } from "next";
import { Archivo, Kanit } from "next/font/google";
import "./globals.css";
import { park } from "@/lib/park/facts";
import { pageMetadata } from "@/lib/seo";
import { getSite, type SiteInfo } from "@/lib/park/content";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const description =
  "Two motocross tracks just off US-131 in Martin, Michigan. Open practice, a dedicated junior track, yearly memberships and online registration.";

// Pages override with pageMetadata(); these defaults cover any page that doesn't.
export const metadata: Metadata = {
  metadataBase: new URL(park.url),
  title: { default: "Martin MX Park | Motocross in Martin, Michigan", template: "%s | Martin MX Park" },
  description,
  applicationName: park.name,
  ...(({ alternates: _, ...rest }) => rest)(pageMetadata({ description, path: "/", og: "home" })),
};

// Structured data so search engines can show the park's address, phone and location.
function jsonLd(site: SiteInfo) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: park.name,
    url: park.url,
    telephone: site.phone,
    email: site.email,
    image: `${park.url}/og/home.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.street,
      addressLocality: site.city,
      addressRegion: site.region,
      postalCode: site.postalCode,
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: park.geo.lat, longitude: park.geo.lng },
    sameAs: [site.facebook, site.instagram].filter(Boolean),
  };
}

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = await getSite();
  return (
    <html lang="en" className={`${kanit.variable} ${archivo.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- static, trusted JSON-LD
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(site)) }}
        />
        {children}
      </body>
    </html>
  );
}
