import "server-only";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Job applications and contact messages, one table item each:
 *   MSG#<id> / MSG   (gsi1: INBOX#<kind> / <createdAt>#<id>)
 * Owners see them in the dashboard inbox; each one is also emailed to them.
 */

export type InboxKind = "application" | "message";

export type InboxItem = {
  id: string;
  kind: InboxKind;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  /** Ordered question/answer pairs as shown to the owner. */
  fields: { label: string; value: string }[];
  read: boolean;
  archived: boolean;
};

let db: DynamoDBDocumentClient | null = null;
function client() {
  db ??= DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" }), {
    marshallOptions: { removeUndefinedValues: true },
  });
  return db;
}
function table() {
  const t = process.env.MARTIN_TABLE;
  if (!t) throw new Error("MARTIN_TABLE is required for the inbox.");
  return t;
}

export async function addInboxItem(item: Omit<InboxItem, "id" | "createdAt" | "read" | "archived">) {
  const full: InboxItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString(), read: false, archived: false };
  await client().send(
    new PutCommand({
      TableName: table(),
      Item: { pk: `MSG#${full.id}`, sk: "MSG", gsi1pk: `INBOX#${full.kind}`, gsi1sk: `${full.createdAt}#${full.id}`, ...full },
    }),
  );
  return full;
}

export async function listInbox(kind: InboxKind): Promise<InboxItem[]> {
  const items: InboxItem[] = [];
  let start: Record<string, unknown> | undefined;
  do {
    const res = await client().send(
      new QueryCommand({
        TableName: table(),
        IndexName: "gsi1",
        KeyConditionExpression: "gsi1pk = :p",
        ExpressionAttributeValues: { ":p": `INBOX#${kind}` },
        ScanIndexForward: false,
        ExclusiveStartKey: start,
      }),
    );
    for (const i of res.Items ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { pk, sk, gsi1pk, gsi1sk, ...rest } = i;
      items.push(rest as InboxItem);
    }
    start = res.LastEvaluatedKey;
  } while (start);
  return items;
}

export async function updateInboxItem(id: string, patch: Partial<Pick<InboxItem, "read" | "archived">>) {
  const sets = Object.entries(patch).filter(([, v]) => v !== undefined);
  if (!sets.length) return;
  await client().send(
    new UpdateCommand({
      TableName: table(),
      Key: { pk: `MSG#${id}`, sk: "MSG" },
      UpdateExpression: `SET ${sets.map(([k]) => `#${k} = :${k}`).join(", ")}`,
      ConditionExpression: "attribute_exists(pk)",
      ExpressionAttributeNames: Object.fromEntries(sets.map(([k]) => [`#${k}`, k])),
      ExpressionAttributeValues: Object.fromEntries(sets.map(([k, v]) => [`:${k}`, v])),
    }),
  );
}

export async function unreadCounts() {
  const [apps, msgs] = await Promise.all([listInbox("application"), listInbox("message")]);
  const count = (l: InboxItem[]) => l.filter((i) => !i.read && !i.archived).length;
  return { application: count(apps), message: count(msgs) };
}
