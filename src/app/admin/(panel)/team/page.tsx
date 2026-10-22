import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TeamManager } from "@/components/admin/team-manager";
import { listOwners } from "@/lib/auth/owners";
import { requireOwner } from "@/lib/auth/session";
import { park } from "@/lib/park/facts";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const [me, team] = await Promise.all([requireOwner(), listOwners()]);
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/admin/more" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> All sections
      </Link>
      <header>
        <h1 className="text-3xl font-bold">Team</h1>
        <p className="mt-1 text-muted-foreground">Who can sign in to this dashboard.</p>
      </header>
      <TeamManager team={team} me={me.email} signInUrl={`${park.url}/admin`} />
    </div>
  );
}
