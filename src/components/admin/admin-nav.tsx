"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Flag, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const adminNav = [
  { href: "/admin", label: "Today", icon: Flag },
  { href: "/admin/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/admin/riders", label: "Riders", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function useActive() {
  const pathname = usePathname();
  // Longest match wins so /admin doesn't light up on every sub-page.
  return (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
}

export function SidebarNav() {
  const isActive = useActive();
  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {adminNav.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-medium transition",
            isActive(href) ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/6 hover:text-white",
          )}
        >
          <Icon className={cn("size-5", isActive(href) && "text-volt")} aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

/** Thumb-reachable tab bar for phones. */
export function BottomTabs() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Dashboard"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden print:hidden"
    >
      <ul className="grid grid-cols-4">
        {adminNav.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                isActive(href) ? "text-brand" : "text-black/50",
              )}
            >
              <Icon className="size-6" strokeWidth={isActive(href) ? 2.4 : 1.8} aria-hidden />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
