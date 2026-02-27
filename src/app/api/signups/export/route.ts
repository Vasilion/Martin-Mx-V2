import { NextRequest, NextResponse } from "next/server";
import { getSignupStore } from "@/lib/store";

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const selectedDate = request.nextUrl.searchParams.get("selectedDate") ?? undefined;
  const bikeClass = request.nextUrl.searchParams.get("bikeClass") ?? undefined;
  const formType = request.nextUrl.searchParams.get("formType") ?? undefined;

  const store = getSignupStore();
  const signups = await store.listSignups({ selectedDate, bikeClass, formType });

  const header = ["referenceId", "formType", "createdAt", "riderName", "email", "bikeClass", "selectedDate"];
  const rows = signups.map((item) => [
    item.referenceId,
    item.formType,
    item.createdAt,
    String(item.payload.riderFullName ?? item.payload.fullName ?? ""),
    String(item.payload.riderEmail ?? item.payload.email ?? ""),
    String(item.payload.bikeClass ?? ""),
    String(item.payload.selectedDate ?? ""),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((field) => escapeCsv(String(field))).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=signups-export.csv",
    },
  });
}
