import { currentOwner } from "@/lib/auth/session";
import { getRoster } from "@/lib/admin/roster";

export const runtime = "nodejs";

const cell = (v: unknown) => {
  const s = String(v ?? "");
  // Quote everything; neutralize spreadsheet formula injection.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await currentOwner())) return new Response("Unauthorized", { status: 401 });
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return new Response("Bad date", { status: 400 });
  const { riders } = await getRoster(date);
  const header = ["Number", "First name", "Last name", "Class", "Bike cc", "Age group", "Phone", "Email", "Paid", "Checked in"];
  const rows = riders.map((r) => [r.riderNumber, r.firstName, r.lastName, r.classLabel, r.bikeSize, r.ageGroup, r.phone, r.email, r.amount, r.checkedIn ? "yes" : "no"]);
  const csv = [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="martin-mx-riders-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}
