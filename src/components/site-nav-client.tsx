"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type NavItem = {
  href: string;
  label: string;
};

type SiteNavClientProps = {
  navLinks: NavItem[];
  cmsButtonLabel: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
};

export function SiteNavClient({ navLinks, cmsButtonLabel, contactPhone, contactEmail, address }: SiteNavClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/90 text-white backdrop-blur">
      <div className="border-b border-white/10 bg-black/45">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-1.5 text-[11px] text-zinc-300">
          <p>{contactPhone}</p>
          <p>{contactEmail}</p>
          <p className="hidden md:block">{address}</p>
        </div>
      </div>
      <nav className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="rounded-xl border border-zinc-700/70 bg-zinc-900/80 px-3 py-2">
            <span className="sr-only">Martin MX Park</span>
            <div className="relative h-7 w-44">
              <Image src="/media/sponsors/martin-logo-white.svg" alt="Martin MX Park" fill sizes="176px" className="object-contain object-left" />
            </div>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] transition ${
                  pathname === item.href ? "bg-green-700/20 text-green-300" : "text-zinc-200 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="mx-cta-primary px-3 py-1.5 text-sm"
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

        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              id="mobile-site-nav"
              className="mt-3 space-y-2 border-t border-zinc-800 pt-3 md:hidden"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-2 py-2 text-sm ${pathname === item.href ? "bg-green-700/20 text-green-300" : "hover:bg-zinc-800"}`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/admin"
                className="mx-cta-primary mt-2 block px-3 py-2 text-sm"
                onClick={() => setIsOpen(false)}
              >
                {cmsButtonLabel}
              </Link>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>
    </header>
  );
}
