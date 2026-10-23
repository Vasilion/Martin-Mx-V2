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
import type { SiteInfo, Content } from "@/lib/park/content";
import { AnnouncementBar } from "@/components/site/announcement-bar";

/** `registerOpen`: practice sign-ups are live. Off, the Register CTA gives way to Membership (always on sale). */
export function SiteHeader({
  site,
  announcement,
  registerOpen,
  membershipOpen,
}: {
  site: SiteInfo;
  announcement: Content<"announcement">;
  registerOpen: boolean;
  membershipOpen: boolean;
}) {
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
      <AnnouncementBar announcement={announcement} />
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:gap-6 md:h-20 md:px-8">
        <Link href="/" aria-label="Martin MX Park home" className="shrink-0">
          <Logo className="h-[15px] w-auto min-[380px]:h-[18px] md:h-[22px]" />
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
          {site.storeUrl && (
            <a
              href={site.storeUrl}
              target="_blank"
              rel="noreferrer"
              className="eyebrow flex items-center gap-1 px-3 py-2 text-white/75 transition-colors hover:text-white"
            >
              Store <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          )}
        </nav>

        {(registerOpen || membershipOpen) && (
          <Button asChild variant="race" size="lg" className="ml-auto h-9 px-3 text-[0.8rem] min-[380px]:h-10 min-[380px]:px-5 min-[380px]:text-sm lg:ml-2">
            {registerOpen ? <Link href="/register">Register</Link> : <Link href="/register?tab=membership">Membership</Link>}
          </Button>
        )}

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon-lg"
              className={cn("-mr-2 text-white lg:hidden", !registerOpen && !membershipOpen && "ml-auto")}
              aria-label="Open menu"
            >
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="border-white/10 bg-ink p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-16">
              <nav aria-label="Mobile" className="flex flex-col">
                {[{ href: "/", label: "Home" }, ...(registerOpen ? [{ href: "/register", label: "Register" }] : []), ...primaryNav].map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="display border-b border-white/10 py-3 text-[clamp(1.75rem,9vw,2.25rem)] text-white transition-colors hover:text-volt"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <ul className="mt-6">
                {secondaryNav.map((item) => (
                  <li key={item.href}>
                    <SheetClose asChild>
                      <Link href={item.href} className="block py-2.5 text-lg font-semibold text-white/70 hover:text-white">
                        {item.label}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
                {site.storeUrl && (
                  <li>
                    <a href={site.storeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 py-2.5 text-lg font-semibold text-white/70 hover:text-white">
                      Merch store <ArrowUpRight className="size-4" aria-hidden />
                    </a>
                  </li>
                )}
              </ul>
              <div className="mt-auto pt-10 text-sm text-white/60">
                <p>{site.addressFull}</p>
                <a href={site.phoneHref} className="mt-1 block text-white">
                  {site.phone}
                </a>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
