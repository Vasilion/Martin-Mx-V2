"use client";

import { useMemo, useState } from "react";

type SignupItem = {
  referenceId: string;
  formType: string;
  createdAt: string;
  payload: Record<string, unknown>;
};

export function PrintListClient() {
  const [date, setDate] = useState("");
  const [bikeClass, setBikeClass] = useState("");
  const [items, setItems] = useState<SignupItem[]>([]);
  const [status, setStatus] = useState("");

  const printableRows = useMemo(
    () =>
      items.map((item) => ({
        referenceId: item.referenceId,
        riderName: String(item.payload.riderFullName ?? item.payload.fullName ?? ""),
        riderEmail: String(item.payload.riderEmail ?? item.payload.email ?? ""),
        bikeClass: String(item.payload.bikeClass ?? ""),
        selectedDate: String(item.payload.selectedDate ?? ""),
      })),
    [items],
  );

  async function load() {
    const params = new URLSearchParams();
    if (date) params.set("selectedDate", date);
    if (bikeClass) params.set("bikeClass", bikeClass);

    const response = await fetch(`/api/signups?${params.toString()}`);
    const data = (await response.json()) as { signups?: SignupItem[] };
    setItems(data.signups ?? []);
    setStatus(`Loaded ${data.signups?.length ?? 0} records.`);
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <input
          value={date}
          onChange={(event) => setDate(event.target.value)}
          type="date"
          className="rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-white"
        />
        <select
          value={bikeClass}
          onChange={(event) => setBikeClass(event.target.value)}
          className="rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-white"
        >
          <option value="">All classes</option>
          <option value="AB">AB</option>
          <option value="C">C</option>
          <option value="Mini">Mini</option>
          <option value="JR">JR</option>
        </select>
        <button type="button" onClick={load} className="rounded bg-red-700 px-4 py-2 text-white">
          Load Signups
        </button>
        <button type="button" onClick={() => window.print()} className="rounded bg-zinc-700 px-4 py-2 text-white">
          Print
        </button>
      </div>
      {status ? <p className="text-sm text-zinc-300">{status}</p> : null}
      <div className="rounded border border-zinc-700 bg-zinc-900 p-4">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="pb-2">Reference</th>
              <th className="pb-2">Rider</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Class</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {printableRows.map((row) => (
              <tr key={row.referenceId} className="border-t border-zinc-800">
                <td className="py-2">{row.referenceId}</td>
                <td className="py-2">{row.riderName}</td>
                <td className="py-2">{row.riderEmail}</td>
                <td className="py-2">{row.bikeClass}</td>
                <td className="py-2">{row.selectedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
