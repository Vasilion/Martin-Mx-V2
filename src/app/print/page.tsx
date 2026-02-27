import { PrintListClient } from "@/components/print-list-client";

export default function PrintPage() {
  return (
    <section className="space-y-6 text-white">
      <header className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <h1 className="text-3xl font-bold md:text-4xl">Print Rider List</h1>
        <p className="mt-2 text-zinc-300">
          Filter by date/class/form type, then print or export rider records for gate and registration operations.
        </p>
      </header>
      <PrintListClient />
    </section>
  );
}
