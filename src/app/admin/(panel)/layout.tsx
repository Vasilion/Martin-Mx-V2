import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { BottomTabs, SidebarNav } from "@/components/admin/admin-nav";
import { requireOwner } from "@/lib/auth/session";
import { logout } from "@/app/admin/actions";
import { Toaster } from "@/components/admin/toaster";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const owner = await requireOwner();
  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[248px_1fr] print:block">
      {/* Desktop sidebar */}
      <aside className="hidden flex-col bg-ink p-5 text-white lg:flex print:hidden">
        <Link href="/admin" className="px-3 py-2">
          <Logo className="h-[18px] w-auto" />
          <span className="mt-2 block text-xs font-medium uppercase tracking-[0.2em] text-white/45">Dashboard</span>
        </Link>
        <div className="mt-8">
          <SidebarNav />
        </div>
        <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/65 hover:bg-white/6 hover:text-white">
            <ExternalLink className="size-4" aria-hidden /> View site
          </a>
          <form action={logout}>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/65 hover:bg-white/6 hover:text-white">
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </form>
          <p className="truncate px-3 pt-2 text-xs text-white/40">{owner.name}</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-ink px-4 text-white lg:hidden print:hidden">
        <Link href="/admin" aria-label="Dashboard home">
          <Logo className="h-[15px] w-auto" />
        </Link>
        <div className="flex items-center gap-1">
          <a href="/" target="_blank" aria-label="View site" className="grid size-10 place-items-center rounded-md text-white/75 hover:text-white">
            <ExternalLink className="size-5" />
          </a>
          <form action={logout}>
            <button aria-label="Sign out" className="grid size-10 place-items-center rounded-md text-white/75 hover:text-white">
              <LogOut className="size-5" />
            </button>
          </form>
        </div>
      </header>

      <main className="min-w-0 px-4 pb-28 pt-5 md:px-8 md:pt-8 lg:pb-12 print:p-0">{children}</main>
      <BottomTabs />
      <Toaster />
    </div>
  );
}
