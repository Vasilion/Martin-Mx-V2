import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Martin MX Dashboard" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0b0b0b" };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="theme-admin min-h-svh">{children}</div>;
}
