import Link from "next/link";
import { getSignupStore } from "@/lib/store";

type SummaryResponse = {
  summary: {
    total: number;
    byFormType: Record<string, number>;
  };
  recent: Array<{
    referenceId: string;
    formType: string;
    createdAt: string;
    riderName: string;
    bikeClass: string;
    selectedDate: string;
  }>;
};

async function getSummary(): Promise<SummaryResponse> {
  const store = getSignupStore();
  const signups = await store.listSignups();

  const byFormType = signups.reduce<Record<string, number>>((acc, item) => {
    acc[item.formType] = (acc[item.formType] ?? 0) + 1;
    return acc;
  }, {});

  const recent = signups
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10)
    .map((item) => ({
      referenceId: item.referenceId,
      formType: item.formType,
      createdAt: item.createdAt,
      riderName: String(item.payload.riderFullName ?? item.payload.fullName ?? ""),
      bikeClass: String(item.payload.bikeClass ?? ""),
      selectedDate: String(item.payload.selectedDate ?? ""),
    }));

  return {
    summary: {
      total: signups.length,
      byFormType,
    },
    recent,
  };
}

export default async function AdminDashboardPage() {
  const summaryData = await getSummary();
  const byFormType = summaryData?.summary.byFormType ?? {};

  return (
    <section className="space-y-6 text-white">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-zinc-300">
          Live operations summary for signup volume and recent submissions.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded border border-zinc-700 bg-zinc-900 p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Total Signups</p>
          <p className="mt-2 text-2xl font-semibold">{summaryData?.summary.total ?? 0}</p>
        </article>
        {Object.entries(byFormType).map(([formType, count]) => (
          <article key={formType} className="rounded border border-zinc-700 bg-zinc-900 p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-400">{formType}</p>
            <p className="mt-2 text-2xl font-semibold">{count}</p>
          </article>
        ))}
      </div>

      <article className="rounded border border-zinc-700 bg-zinc-900 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Signups</h2>
          <Link href="/print" className="rounded bg-red-700 px-3 py-1 text-sm font-medium">
            Open Print Tools
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-400">
              <tr>
                <th className="pb-2">Reference</th>
                <th className="pb-2">Form</th>
                <th className="pb-2">Rider</th>
                <th className="pb-2">Class</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {(summaryData?.recent ?? []).map((item) => (
                <tr key={item.referenceId} className="border-t border-zinc-800">
                  <td className="py-2">{item.referenceId}</td>
                  <td className="py-2">{item.formType}</td>
                  <td className="py-2">{item.riderName}</td>
                  <td className="py-2">{item.bikeClass}</td>
                  <td className="py-2">{item.selectedDate}</td>
                  <td className="py-2">{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
