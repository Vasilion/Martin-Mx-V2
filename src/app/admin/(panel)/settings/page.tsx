import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/settings-form";
import { getMembership, getPractice } from "@/lib/park/live";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [practice, membership] = await Promise.all([getPractice(), getMembership()]);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Prices, spots, hours and membership. Saving updates the site right away.</p>
      </header>
      <SettingsForm practice={practice} membership={membership} />
    </div>
  );
}
