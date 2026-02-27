"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
  const prefersReducedMotion = useReducedMotion();

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
                  className="block rounded-lg px-2 py-2 text-sm hover:bg-zinc-800"
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
