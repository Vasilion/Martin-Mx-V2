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
    <header className="border-b border-zinc-800 bg-zinc-950 text-white">
      <nav className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm font-semibold tracking-wide text-zinc-200">
            Martin MX Park
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} className="rounded px-2 py-1 text-sm hover:bg-zinc-800">
                {item.label}
              </Link>
            ))}
            <Link href="/admin" className="rounded bg-red-700 px-3 py-1 text-sm font-medium hover:bg-red-600">
              {cmsButtonLabel}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            aria-expanded={isOpen}
            aria-controls="mobile-site-nav"
            className="rounded border border-zinc-700 px-3 py-1 text-sm text-zinc-200 md:hidden"
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
                className="block rounded px-2 py-2 text-sm hover:bg-zinc-800"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="mt-2 block rounded bg-red-700 px-3 py-2 text-sm font-medium hover:bg-red-600"
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
