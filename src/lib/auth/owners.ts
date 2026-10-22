import "server-only";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

/** Owner accounts: OWNER / <lowercased email>. Created with scripts/create-owner.mjs. */
export type Owner = { email: string; name: string; passwordHash: string; failedLogins?: number; lockedUntil?: string };

const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

let db: DynamoDBDocumentClient | null = null;
function client() {
  db ??= DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" }));
  return db;
}
function table() {
  const t = process.env.MARTIN_TABLE;
  if (!t) throw new Error("MARTIN_TABLE is required for owner accounts.");
  return t;
}

export async function getOwner(email: string): Promise<Owner | null> {
  const res = await client().send(new GetCommand({ TableName: table(), Key: { pk: "OWNER", sk: email.trim().toLowerCase() } }));
  return (res.Item as Owner | undefined) ?? null;
}

export type LoginResult = { ok: true; owner: Owner } | { ok: false; reason: "invalid" | "locked" };

/** Checks a password, counting failures and locking the account after too many in a row. */
export async function attemptLogin(email: string, password: string): Promise<LoginResult> {
  const owner = await getOwner(email);
  if (!owner) {
    await verifyPassword(password, "scrypt$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(86) + "=="); // equalize timing
    return { ok: false, reason: "invalid" };
  }
  if (owner.lockedUntil && owner.lockedUntil > new Date().toISOString()) return { ok: false, reason: "locked" };

  const key = { pk: "OWNER", sk: owner.email };
  if (await verifyPassword(password, owner.passwordHash)) {
    if (owner.failedLogins) {
      await client().send(new UpdateCommand({ TableName: table(), Key: key, UpdateExpression: "REMOVE failedLogins, lockedUntil" }));
    }
    return { ok: true, owner };
  }
  const fails = (owner.failedLogins ?? 0) + 1;
  const lock = fails >= MAX_FAILS ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : undefined;
  await client().send(
    new UpdateCommand({
      TableName: table(),
      Key: key,
      UpdateExpression: lock ? "SET failedLogins = :z, lockedUntil = :l" : "SET failedLogins = :f",
      ExpressionAttributeValues: lock ? { ":z": 0, ":l": lock } : { ":f": fails },
    }),
  );
  return { ok: false, reason: lock ? "locked" : "invalid" };
}

/** Owner changes their own password (current one required). */
export async function changePassword(email: string, current: string, next: string) {
  const owner = await getOwner(email);
  if (!owner || !(await verifyPassword(current, owner.passwordHash))) return false;
  await client().send(
    new UpdateCommand({
      TableName: table(),
      Key: { pk: "OWNER", sk: owner.email },
      UpdateExpression: "SET passwordHash = :h, passwordChangedAt = :t",
      ExpressionAttributeValues: { ":h": await hashPassword(next), ":t": new Date().toISOString() },
    }),
  );
  return true;
}
