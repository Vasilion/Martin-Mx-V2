import { NextRequest, NextResponse } from "next/server";
import { getSignupStore } from "@/lib/store";

type Summary = {
  total: number;
  byFormType: Record<string, number>;
};

function buildSummary(formTypes: string[]): Summary {
  const byFormType = formTypes.reduce<Record<string, number>>((acc, formType) => {
    acc[formType] = (acc[formType] ?? 0) + 1;
    return acc;
  }, {});

  return {
    total: formTypes.length,
    byFormType,
  };
}

export async function GET(request: NextRequest) {
  const selectedDate = request.nextUrl.searchParams.get("selectedDate") ?? undefined;
  const store = getSignupStore();
  const signups = await store.listSignups({ selectedDate });
  const summary = buildSummary(signups.map((item) => item.formType));

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

  return NextResponse.json({
    ok: true,
    selectedDate: selectedDate ?? null,
    summary,
    recent,
  });
}
