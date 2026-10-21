"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Flag, LayoutGrid, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const adminNav = [
  { href: "/admin", label: "Today", icon: Flag },
  { href: "/admin/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/admin/riders", label: "Riders", icon: Users },
  { href: "/admin/more", label: "More", icon: LayoutGrid },
] as const;

function useActive() {
  const pathname = usePathname();
  // Longest match wins so /admin doesn't light up on every sub-page.
  return (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    // Every editing screen lives under "More".
    if (href === "/admin/more") return ["/admin/more", "/admin/content", "/admin/settings", "/admin/inbox"].some((p) => pathname.startsWith(p));
    return pathname.startsWith(href);
  };
}

export function SidebarNav({ unread = 0 }: { unread?: number }) {
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
          {href === "/admin/more" && unread > 0 && <span className="ml-auto rounded-full bg-volt px-2 text-xs font-bold leading-5 text-ink">{unread}</span>}
        </Link>
      ))}
    </nav>
  );
}

/** Thumb-reachable tab bar for phones. */
export function BottomTabs({ unread = 0 }: { unread?: number }) {
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
              <span className="relative">
                <Icon className="size-6" strokeWidth={isActive(href) ? 2.4 : 1.8} aria-hidden />
                {href === "/admin/more" && unread > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 min-w-5 rounded-full bg-destructive px-1 text-center text-[10px] font-bold leading-5 text-white">{unread}</span>
                )}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
