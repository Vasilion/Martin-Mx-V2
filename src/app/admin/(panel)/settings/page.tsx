import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SettingsForm } from "@/components/admin/settings-form";
import { getMembership, getPractice } from "@/lib/park/live";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [practice, membership] = await Promise.all([getPractice(), getMembership()]);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/more" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> All sections
      </Link>
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Prices, spots, hours and membership. Saving updates the site right away.</p>
      </header>
      <SettingsForm practice={practice} membership={membership} />
    </div>
  );
}
