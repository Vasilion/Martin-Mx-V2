import type { Metadata, Viewport } from "next";
import { Archivo, Kanit } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { park } from "@/lib/park/facts";
import { pageMetadata } from "@/lib/seo";

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
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: park.name,
  url: park.url,
  telephone: park.phone.display,
  email: park.email,
  image: `${park.url}/og/home.jpg`,
  address: {
    "@type": "PostalAddress",
    streetAddress: park.address.street,
    addressLocality: park.address.city,
    addressRegion: park.address.region,
    postalCode: park.address.postalCode,
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: park.geo.lat, longitude: park.geo.lng },
  sameAs: [park.social.facebook, park.social.instagram],
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${kanit.variable} ${archivo.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- static, trusted JSON-LD
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-sm bg-volt px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <TooltipProvider>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </TooltipProvider>
      </body>
    </html>
  );
}
