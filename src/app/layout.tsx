import type { Metadata, Viewport } from "next";
import { Archivo, Kanit } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { park } from "@/lib/park/facts";

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

export const metadata: Metadata = {
  metadataBase: new URL(park.url),
  title: { default: "Martin MX Park | Motocross in Martin, Michigan", template: "%s | Martin MX Park" },
  description,
  openGraph: {
    title: "Martin MX Park",
    description,
    url: park.url,
    siteName: park.name,
    type: "website",
    images: [{ url: "/photos/roost-292.jpg", width: 1800, height: 1200, alt: "Rider roosting at Martin MX Park" }],
  },
  twitter: { card: "summary_large_image", title: "Martin MX Park", description },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${kanit.variable} ${archivo.variable}`}>
      <body>
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
