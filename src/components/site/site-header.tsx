"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/site/logo";
import { primaryNav, secondaryNav } from "@/components/site/nav-links";
import { park } from "@/lib/park/facts";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-white/10 bg-ink/85 backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-ink/80 to-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 md:h-20 md:px-8">
        <Link href="/" aria-label="Martin MX Park home" className="shrink-0">
          <Logo className="h-[18px] w-auto md:h-[22px]" />
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "eyebrow relative px-3 py-2 text-white/75 transition-colors hover:text-white",
                "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-volt after:transition-transform hover:after:scale-x-100",
                isActive(item.href) && "text-white after:scale-x-100",
              )}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={park.storeUrl}
            target="_blank"
            rel="noreferrer"
            className="eyebrow flex items-center gap-1 px-3 py-2 text-white/75 transition-colors hover:text-white"
          >
            Store <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        </nav>

        <Button asChild variant="race" size="lg" className="ml-auto h-10 px-5 lg:ml-2">
          <Link href="/register">Register</Link>
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-lg" className="-mr-2 text-white lg:hidden" aria-label="Open menu">
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full border-white/10 bg-ink p-0 sm:max-w-md">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-20">
              <nav aria-label="Mobile" className="flex flex-col">
                {[{ href: "/", label: "Home" }, { href: "/register", label: "Register" }, ...primaryNav].map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="display border-b border-white/10 py-3 text-4xl text-white transition-colors hover:text-volt"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {secondaryNav.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link href={item.href} className="eyebrow text-white/60 hover:text-white">
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                <a href={park.storeUrl} target="_blank" rel="noreferrer" className="eyebrow text-white/60 hover:text-white">
                  Store ↗
                </a>
              </div>
              <div className="mt-auto pt-10 text-sm text-white/60">
                <p>{park.address.full}</p>
                <a href={park.phone.href} className="mt-1 block text-white">
                  {park.phone.display}
                </a>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
