import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { editSections } from "@/lib/admin/sections";

export const metadata: Metadata = { title: "More" };

export default function MorePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Edit the site</h1>
        <p className="mt-1 text-muted-foreground">Every word and photo on the site. Changes go live when you save.</p>
      </header>
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
