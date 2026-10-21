import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

let client: SESv2Client | null = null;

function getClient() {
  if (client) {
    return client;
  }
  const region = process.env.AWS_REGION;
  if (!region) {
    throw new Error("AWS_REGION is required for SES.");
  }
  client = new SESv2Client({ region });
  return client;
}

export async function sendTextEmail(params: { to: string; subject: string; text: string }) {
  const from = process.env.SES_FROM_EMAIL;
  if (!from && process.env.NODE_ENV === "production") {
    throw new Error("SES_FROM_EMAIL is required.");
  }

  if (process.env.NODE_ENV === "test" || !from) {
    return;
  }

  await getClient().send(
    new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [params.to] },
      Content: {
        Simple: {
          Subject: { Data: params.subject },
          Body: { Text: { Data: params.text } },
        },
      },
    }),
  );
}

/** HTML + text email. Skipped (logged) when SES_FROM_EMAIL is unset outside production. */
export async function sendEmail(params: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  const from = process.env.SES_FROM_EMAIL;
  if (!from) {
    if (process.env.NODE_ENV === "production") throw new Error("SES_FROM_EMAIL is required.");
    console.info(`[email skipped: no SES_FROM_EMAIL] to=${params.to} subject=${params.subject}`);
    return;
  }
  if (process.env.NODE_ENV === "test") return;

  const res = await getClient().send(
    new SendEmailCommand({
      FromEmailAddress: `Martin MX Park <${from}>`,
      Destination: { ToAddresses: [params.to] },
      ReplyToAddresses: params.replyTo ? [params.replyTo] : undefined,
      Content: {
        Simple: {
          Subject: { Data: params.subject },
          Body: { Html: { Data: params.html }, Text: { Data: params.text } },
        },
      },
    }),
  );
  if (process.env.NODE_ENV !== "production") console.info(`[email sent] ${res.MessageId} to=${params.to} subject=${params.subject}`);
}
