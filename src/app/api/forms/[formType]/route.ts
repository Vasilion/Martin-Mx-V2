import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildConfirmationEmail } from "@/lib/forms/email";
import { assertRateLimit } from "@/lib/forms/rate-limit";
import { formSchemas, type FormType } from "@/lib/forms/schemas";
import { sendTextEmail } from "@/lib/email/ses";
import { getSignupStore } from "@/lib/store";

function getIdempotencyKey(request: NextRequest, body: Record<string, unknown>) {
  const headerValue = request.headers.get("x-idempotency-key");
  if (headerValue) {
    return headerValue;
  }
  return JSON.stringify(body);
}

function isValidFormType(value: string): value is FormType {
  return value in formSchemas;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ formType: string }> },
) {
  const params = await context.params;
  if (!isValidFormType(params.formType)) {
    return NextResponse.json({ error: "Unknown form type." }, { status: 404 });
  }

  const rawBody = (await request.json()) as Record<string, unknown>;
  const honeyPot = String(rawBody.website ?? "").trim();
  if (honeyPot.length > 0) {
    return NextResponse.json({ ok: true, created: false });
  }

  const requestKey = `${params.formType}:${request.headers.get("x-forwarded-for") ?? "unknown-ip"}`;
  const rateLimit = assertRateLimit(requestKey, 20, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests.", retryAfterMs: rateLimit.retryAfterMs },
      { status: 429 },
    );
  }

  const parsed = formSchemas[params.formType].safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid form payload.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const store = getSignupStore();
  const idempotencyKey = getIdempotencyKey(request, parsed.data);
  const referenceId = randomUUID();
  const putResult = await store.putIfAbsent({
    idempotencyKey,
    referenceId,
    formType: params.formType,
    payload: parsed.data,
    createdAt: new Date().toISOString(),
  });

  const finalReferenceId = putResult.existingReferenceId ?? referenceId;

  if (
    (params.formType === "practice" || params.formType === "daily") &&
    "bikeClass" in parsed.data &&
    "selectedDate" in parsed.data
  ) {
    const bikeClass = String(parsed.data.bikeClass ?? "UNKNOWN");
    const dateKey = String(parsed.data.selectedDate ?? "UNKNOWN");
    await store.decrementSpotCounter(dateKey, bikeClass);
  }

  const email = buildConfirmationEmail(params.formType, parsed.data, finalReferenceId);
  const destinationEmail =
    "riderEmail" in parsed.data
      ? String(parsed.data.riderEmail ?? "")
      : "email" in parsed.data
        ? String(parsed.data.email ?? "")
        : "";
  await sendTextEmail({
    to: destinationEmail,
    subject: email.subject,
    text: email.text,
  });

  return NextResponse.json({
    ok: true,
    created: putResult.created,
    referenceId: finalReferenceId,
  });
}
