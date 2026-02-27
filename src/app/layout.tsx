import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Martin MX Park",
  description: "Modern Martin MX Park website with live operations controls and CMS-managed content.",
  openGraph: {
    title: "Martin MX Park",
    description: "Motocross schedules, registration, memberships, and track info.",
    url: "https://www.martinmxpark.com",
    siteName: "Martin MX Park",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Martin MX Park",
    description: "Motocross schedules, registration, memberships, and track info.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SiteNav />
        <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
