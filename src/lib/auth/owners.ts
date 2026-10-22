import "server-only";
import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { randomBytes } from "node:crypto";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

/** Owner accounts: OWNER / <lowercased email>. Managed on the dashboard Team screen (or scripts/create-owner.mjs). */
export type Owner = {
  email: string;
  name: string;
  passwordHash: string;
  failedLogins?: number;
  lockedUntil?: string;
  /** Set when someone else created the password; cleared when the owner picks their own. */
  tempPassword?: boolean;
  createdAt?: string;
  createdBy?: string;
  lastLoginAt?: string;
};

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
      UpdateExpression: "SET passwordHash = :h, passwordChangedAt = :t REMOVE tempPassword",
      ExpressionAttributeValues: { ":h": await hashPassword(next), ":t": new Date().toISOString() },
    }),
  );
  return true;
}

/** Readable generated password: 4 groups of 4, no ambiguous characters. */
export function generatePassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 4 }, () => Array.from(randomBytes(4), (b) => alphabet[b % alphabet.length]).join("")).join("-");
}

export type TeamMember = { email: string; name: string; tempPassword: boolean; createdAt?: string; createdBy?: string; lastLoginAt?: string };

export async function listOwners(): Promise<TeamMember[]> {
  const res = await client().send(
    new QueryCommand({ TableName: table(), KeyConditionExpression: "pk = :p", ExpressionAttributeValues: { ":p": "OWNER" } }),
  );
  return (res.Items ?? [])
    .map((i) => ({ email: i.email, name: i.name, tempPassword: !!i.tempPassword, createdAt: i.createdAt, createdBy: i.createdBy, lastLoginAt: i.lastLoginAt }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Adds a login with a temporary password (returned once, never stored in plain text). */
export async function createOwner(email: string, name: string, createdBy: string) {
  const password = generatePassword();
  const lower = email.trim().toLowerCase();
  try {
    await client().send(
      new PutCommand({
        TableName: table(),
        Item: { pk: "OWNER", sk: lower, email: lower, name: name.trim(), passwordHash: await hashPassword(password), tempPassword: true, createdAt: new Date().toISOString(), createdBy },
        ConditionExpression: "attribute_not_exists(pk)",
      }),
    );
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) return { ok: false as const, error: "That email already has a login." };
    throw err;
  }
  return { ok: true as const, password };
}

/** New temporary password for someone who forgot theirs. */
export async function resetOwnerPassword(email: string) {
  const password = generatePassword();
  await client().send(
    new UpdateCommand({
      TableName: table(),
      Key: { pk: "OWNER", sk: email.toLowerCase() },
      UpdateExpression: "SET passwordHash = :h, tempPassword = :t REMOVE failedLogins, lockedUntil",
      ConditionExpression: "attribute_exists(pk)",
      ExpressionAttributeValues: { ":h": await hashPassword(password), ":t": true },
    }),
  );
  return password;
}

export async function deleteOwner(email: string) {
  await client().send(new DeleteCommand({ TableName: table(), Key: { pk: "OWNER", sk: email.toLowerCase() } }));
}

export async function recordLogin(email: string) {
  await client().send(
    new UpdateCommand({ TableName: table(), Key: { pk: "OWNER", sk: email }, UpdateExpression: "SET lastLoginAt = :t", ExpressionAttributeValues: { ":t": new Date().toISOString() } }),
  );
}
