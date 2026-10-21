import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { editSections } from "@/lib/admin/sections";
import { unreadCounts } from "@/lib/inbox/store";
import { Inbox } from "lucide-react";

export const metadata: Metadata = { title: "More" };

export default async function MorePage() {
  const unread = await unreadCounts();
  const total = unread.application + unread.message;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Edit the site</h1>
        <p className="mt-1 text-muted-foreground">Every word and photo on the site. Changes go live when you save.</p>
      </header>
      <Link href="/admin/inbox" className="flex items-center gap-4 rounded-lg border bg-card px-4 py-4 transition active:bg-muted md:hover:bg-muted/50">
        <Inbox className="size-6 text-brand" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Inbox</span>
          <span className="block text-sm text-muted-foreground">Job applications and messages</span>
        </span>
        {total > 0 && <span className="rounded-full bg-brand px-2.5 py-0.5 text-sm font-bold text-white">{total} new</span>}
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
      <ul className="divide-y overflow-hidden rounded-lg border bg-card">
        {editSections.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="flex items-center gap-4 px-4 py-4 transition active:bg-muted md:hover:bg-muted/50">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{s.title}</span>
                <span className="block truncate text-sm text-muted-foreground">{s.desc}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
