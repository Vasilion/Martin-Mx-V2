"use client";

import Link from "next/link";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
};

type SiteNavClientProps = {
  navLinks: NavItem[];
  cmsButtonLabel: string;
};

export function SiteNavClient({ navLinks, cmsButtonLabel }: SiteNavClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/85 text-white backdrop-blur">
      <nav className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="rounded-xl border border-zinc-700/70 bg-zinc-900/80 px-3 py-1.5 text-sm font-semibold tracking-[0.16em] text-zinc-100">
            Martin MX Park
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-2.5 py-1.5 text-sm text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="rounded-xl bg-gradient-to-r from-green-700 to-green-600 px-3 py-1.5 text-sm font-medium hover:from-green-600 hover:to-green-500"
            >
              {cmsButtonLabel}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            aria-expanded={isOpen}
            aria-controls="mobile-site-nav"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 md:hidden"
          >
            Menu
          </button>
        </div>

        {isOpen ? (
          <div id="mobile-site-nav" className="mt-3 space-y-2 border-t border-zinc-800 pt-3 md:hidden">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-2 py-2 text-sm hover:bg-zinc-800"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="mt-2 block rounded-xl bg-gradient-to-r from-green-700 to-green-600 px-3 py-2 text-sm font-medium hover:from-green-600 hover:to-green-500"
              onClick={() => setIsOpen(false)}
            >
              {cmsButtonLabel}
            </Link>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
