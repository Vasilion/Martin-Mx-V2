import { PrintListClient } from "@/components/print-list-client";

export default function PrintPage() {
  return (
    <section className="space-y-4 text-white">
      <h1 className="text-3xl font-bold">Print Rider List</h1>
      <p className="rounded border border-zinc-700 bg-zinc-900 p-4 text-zinc-300">
        Filter by date and class, then print rider records for gate and registration operations.
      </p>
      <PrintListClient />
    </section>
  );
}
