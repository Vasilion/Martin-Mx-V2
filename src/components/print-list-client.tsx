"use client";

import { useMemo, useState } from "react";
import { formatDateMMDDYYYY } from "@/lib/datetime-format";

type SignupItem = {
  referenceId: string;
  formType: string;
  createdAt: string;
  payload: Record<string, unknown>;
};

export function PrintListClient() {
  const [date, setDate] = useState("");
  const [bikeClass, setBikeClass] = useState("");
  const [formType, setFormType] = useState("");
  const [items, setItems] = useState<SignupItem[]>([]);
  const [status, setStatus] = useState("");

  const printableRows = useMemo(
    () =>
      items.map((item) => ({
        referenceId: item.referenceId,
        riderName: String(item.payload.riderFullName ?? item.payload.fullName ?? ""),
        riderEmail: String(item.payload.riderEmail ?? item.payload.email ?? ""),
        formType: item.formType,
        bikeClass: String(item.payload.bikeClass ?? ""),
        selectedDate: formatDateMMDDYYYY(String(item.payload.selectedDate ?? "")),
      })),
    [items],
  );

  async function load() {
    const params = new URLSearchParams();
    if (date) params.set("selectedDate", date);
    if (bikeClass) params.set("bikeClass", bikeClass);
    if (formType) params.set("formType", formType);

    const response = await fetch(`/api/signups?${params.toString()}`);
    const data = (await response.json()) as { signups?: SignupItem[] };
    setItems(data.signups ?? []);
    setStatus(`Loaded ${data.signups?.length ?? 0} records.`);
  }

  async function exportCsv() {
    const params = new URLSearchParams();
    if (date) params.set("selectedDate", date);
    if (bikeClass) params.set("bikeClass", bikeClass);
    if (formType) params.set("formType", formType);

    const response = await fetch(`/api/signups/export?${params.toString()}`);
    const content = await response.text();
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "signups-export.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setStatus("Export downloaded.");
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <input
          value={date}
          onChange={(event) => setDate(event.target.value)}
          type="date"
          className="rounded-xl border border-zinc-600 bg-zinc-800 px-3 py-2 text-white"
        />
        <select
          value={bikeClass}
          onChange={(event) => setBikeClass(event.target.value)}
          className="rounded-xl border border-zinc-600 bg-zinc-800 px-3 py-2 text-white"
        >
          <option value="">All classes</option>
          <option value="A/B">A/B</option>
          <option value="C">C</option>
          <option value="Mini">Mini</option>
          <option value="Jr Track">Jr Track</option>
        </select>
        <button type="button" onClick={load} className="rounded-xl bg-green-700 px-4 py-2 text-white">
          Load Signups
        </button>
        <button type="button" onClick={() => window.print()} className="rounded-xl bg-zinc-700 px-4 py-2 text-white">
          Print
        </button>
      </div>
      <select
        value={formType}
        onChange={(event) => setFormType(event.target.value)}
        className="rounded-xl border border-zinc-600 bg-zinc-800 px-3 py-2 text-white"
      >
        <option value="">All forms</option>
        <option value="practice">Practice</option>
        <option value="membership">Membership</option>
        <option value="contact">Contact</option>
        <option value="hiring">Hiring</option>
        <option value="daily">Daily</option>
      </select>
      <button type="button" onClick={exportCsv} className="rounded-xl bg-zinc-700 px-4 py-2 text-sm text-white">
        Export CSV
      </button>
      {status ? <p className="text-sm text-zinc-300">{status}</p> : null}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/75 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.3)] backdrop-blur">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="pb-2">Reference</th>
              <th className="pb-2">Rider</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Form</th>
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
                <td className="py-2">{row.formType}</td>
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
