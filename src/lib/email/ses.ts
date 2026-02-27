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
