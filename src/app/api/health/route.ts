import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "martin-mx-v2",
    timestamp: new Date().toISOString(),
    signupStoreProvider: process.env.SIGNUP_STORE_PROVIDER ?? "memory",
  });
}
