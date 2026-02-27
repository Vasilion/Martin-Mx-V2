import { NextRequest, NextResponse } from "next/server";
import { getSignupStore } from "@/lib/store";

export async function GET(request: NextRequest) {
  const selectedDate = request.nextUrl.searchParams.get("selectedDate") ?? undefined;
  const bikeClass = request.nextUrl.searchParams.get("bikeClass") ?? undefined;

  const store = getSignupStore();
  const signups = await store.listSignups({ selectedDate, bikeClass });

  return NextResponse.json({ ok: true, count: signups.length, signups });
}
