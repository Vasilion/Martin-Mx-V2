import type { FormType } from "@/lib/forms/schemas";

type EmailContent = {
  subject: string;
  text: string;
};

type Payload = Record<string, unknown>;

function linesFromPayload(payload: Payload, referenceId: string) {
  const base = [
    `referenceId: ${referenceId}`,
    `submittedAt: ${new Date().toISOString()}`,
  ];
  const dynamic = Object.entries(payload).map(([key, value]) => `${key}: ${String(value)}`);
  return [...base, ...dynamic].join("\n");
}

export function buildConfirmationEmail(
  formType: FormType,
  payload: Payload,
  referenceId: string,
): EmailContent {
  const subjectMap: Record<FormType, string> = {
    practice: `Martin MX Practice Signup Confirmation - ${String(payload.selectedDate ?? "")}`.trim(),
    membership: `Martin MX Membership Confirmation - ${String(payload.membershipType ?? "")}`.trim(),
    contact: "We Received Your Message - Martin MX",
    hiring: "Martin MX Hiring Application Received",
    daily: `Martin MX Daily Signup Confirmation - ${String(payload.selectedDate ?? "")}`.trim(),
  };

  return {
    subject: subjectMap[formType],
    text: linesFromPayload(payload, referenceId),
  };
}
