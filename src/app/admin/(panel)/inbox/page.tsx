import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { InboxList } from "@/components/admin/inbox-list";
import { listInbox } from "@/lib/inbox/store";

export const metadata: Metadata = { title: "Inbox" };

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const kind = tab === "messages" ? "message" : "application";
  const [apps, msgs] = await Promise.all([listInbox("application"), listInbox("message")]);
  const unread = (l: typeof apps) => l.filter((i) => !i.read && !i.archived).length;
  const tabs = [
    { id: "applications", label: "Applications", count: unread(apps), href: "/admin/inbox" },
    { id: "messages", label: "Messages", count: unread(msgs), href: "/admin/inbox?tab=messages" },
  ];
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="text-3xl font-bold">Inbox</h1>
        <p className="mt-1 text-muted-foreground">Job applications and messages from the site. Each one is also emailed to you.</p>
      </header>
      <nav className="grid grid-cols-2 gap-1 rounded-lg border bg-card p-1" aria-label="Inbox">
        {tabs.map((t) => {
          const active = (t.id === "messages") === (kind === "message");
          return (
            <Link
              key={t.id}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={cn("flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold", active ? "bg-ink text-white" : "text-muted-foreground")}
            >
              {t.label}
              {t.count > 0 && <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-volt text-ink" : "bg-brand text-white")}>{t.count}</span>}
            </Link>
          );
        })}
      </nav>
      <InboxList key={kind} items={kind === "message" ? msgs : apps} emptyText={kind === "message" ? "No messages yet." : "No applications yet."} />
    </div>
  );
}
