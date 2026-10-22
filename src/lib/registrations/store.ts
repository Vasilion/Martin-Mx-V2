import "server-only";
import {
  DynamoDBClient,
  ConditionalCheckFailedException,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type { PracticeRegistration } from "@/lib/register/schema";

/**
 * Registrations, memberships and spot counters in one DynamoDB table (`MARTIN_TABLE`).
 *
 *   REG#<id>        / REG          a practice registration   (gsi1: DAY#<date> / <createdAt>#<id>)
 *   DAY#<date>      / CLASS#<id>   spots taken for a class   (pending holds + paid)
 *   MEM#<id>        / MEM          a yearly membership       (gsi1: MEMBERS / <createdAt>#<id>)
 *   PI#<intentId>   / PI           payment intent -> registration (so refunds find the rider)
 *
 * A spot is reserved *before* checkout with a conditional increment, so the last spot
 * can't be sold twice. Expired or abandoned checkouts release it.
 * With no table configured (local dev without AWS, tests), an in-memory store is used.
 */

export type RegistrationStatus = "pending" | "paid" | "expired" | "refunded";

export type Registration = Omit<PracticeRegistration, "waiverAck"> & {
  id: string;
  status: RegistrationStatus;
  amount: number;
  createdAt: string;
  paidAt?: string;
  stripeSessionId?: string;
  checkedIn?: boolean;
};

export type MembershipRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  amount: number;
  year: number;
  stripeSessionId: string;
  createdAt: string;
};

export class SoldOutError extends Error {
  constructor() {
    super("That class is full for this day.");
  }
}

export interface RegistrationStore {
  /** Atomically takes a spot (if under capacity) and writes a pending registration. */
  reserve(reg: Registration, capacity: number): Promise<void>;
  attachSession(id: string, sessionId: string): Promise<void>;
  /** pending -> paid. Returns the registration, or null if it wasn't pending. */
  markPaid(id: string, paidAt: string): Promise<Registration | null>;
  /** pending -> expired and gives the spot back. No-op if already paid/expired. */
  release(id: string): Promise<void>;
  /** Remembers which registration a Stripe payment intent paid for. */
  linkPaymentIntent(intentId: string, registrationId: string): Promise<void>;
  /** paid -> refunded and gives the spot back. Returns false if it wasn't paid. */
  refundByPaymentIntent(intentId: string): Promise<boolean>;
  get(id: string): Promise<Registration | null>;
  /** Gate check-in (paid registrations only). */
  setCheckedIn(id: string, checkedIn: boolean): Promise<void>;
  listByDay(date: string): Promise<Registration[]>;
  spotsTaken(date: string): Promise<Record<string, number>>;
  /** Writes once per Stripe session; false on webhook retries. */
  putMembership(m: MembershipRecord): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// DynamoDB

type CancelReasons = { CancellationReasons?: { Code?: string }[] };

/**
 * Concurrent transactions on the same counter item get cancelled with TransactionConflict.
 * That's contention, not a sold-out class: retry with jittered backoff.
 */
async function withConflictRetry<T>(
  fn: () => Promise<T>,
  attempts = 8,
): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      const reasons = (err as CancelReasons).CancellationReasons ?? [];
      const conflict = reasons.some((r) => r.Code === "TransactionConflict");
      if (!conflict || i >= attempts - 1) throw err;
      await new Promise((r) =>
        setTimeout(r, 25 * 2 ** i * (0.5 + Math.random())),
      );
    }
  }
}

class DynamoStore implements RegistrationStore {
  private db: DynamoDBDocumentClient;
  constructor(private table: string) {
    this.db = DynamoDBDocumentClient.from(
      new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" }),
      {
        marshallOptions: { removeUndefinedValues: true },
      },
    );
  }

  async reserve(reg: Registration, capacity: number) {
    try {
      await withConflictRetry(() =>
        this.db.send(
          new TransactWriteCommand({
            TransactItems: [
              {
                Update: {
                  TableName: this.table,
                  Key: { pk: `DAY#${reg.date}`, sk: `CLASS#${reg.classId}` },
                  UpdateExpression:
                    "SET taken = if_not_exists(taken, :zero) + :one",
                  ConditionExpression:
                    "attribute_not_exists(taken) OR taken < :cap",
                  ExpressionAttributeValues: {
                    ":zero": 0,
                    ":one": 1,
                    ":cap": capacity,
                  },
                },
              },
              {
                Put: {
                  TableName: this.table,
                  Item: {
                    pk: `REG#${reg.id}`,
                    sk: "REG",
                    gsi1pk: `DAY#${reg.date}`,
                    gsi1sk: `${reg.createdAt}#${reg.id}`,
                    ...reg,
                  },
                  ConditionExpression: "attribute_not_exists(pk)",
                },
              },
            ],
          }),
        ),
      );
    } catch (err) {
      const reasons = (err as CancelReasons).CancellationReasons;
      if (reasons?.[0]?.Code === "ConditionalCheckFailed")
        throw new SoldOutError();
      throw err;
    }
  }

  async attachSession(id: string, sessionId: string) {
    await this.db.send(
      new UpdateCommand({
        TableName: this.table,
        Key: { pk: `REG#${id}`, sk: "REG" },
        UpdateExpression: "SET stripeSessionId = :s",
        ExpressionAttributeValues: { ":s": sessionId },
      }),
    );
  }

  async markPaid(id: string, paidAt: string) {
    try {
      const res = await this.db.send(
        new UpdateCommand({
          TableName: this.table,
          Key: { pk: `REG#${id}`, sk: "REG" },
          UpdateExpression: "SET #s = :paid, paidAt = :at",
          ConditionExpression: "#s = :pending",
          ExpressionAttributeNames: { "#s": "status" },
          ExpressionAttributeValues: {
            ":paid": "paid",
            ":pending": "pending",
            ":at": paidAt,
          },
          ReturnValues: "ALL_NEW",
        }),
      );
      return strip(res.Attributes) as Registration;
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) return null;
      throw err;
    }
  }

  async release(id: string) {
    const reg = await this.get(id);
    if (!reg || reg.status !== "pending") return;
    try {
      await withConflictRetry(() =>
        this.db.send(
          new TransactWriteCommand({
            TransactItems: [
              {
                Update: {
                  TableName: this.table,
                  Key: { pk: `REG#${id}`, sk: "REG" },
                  UpdateExpression: "SET #s = :expired",
                  ConditionExpression: "#s = :pending",
                  ExpressionAttributeNames: { "#s": "status" },
                  ExpressionAttributeValues: {
                    ":expired": "expired",
                    ":pending": "pending",
                  },
                },
              },
              {
                Update: {
                  TableName: this.table,
                  Key: { pk: `DAY#${reg.date}`, sk: `CLASS#${reg.classId}` },
                  UpdateExpression: "SET taken = taken - :one",
                  ConditionExpression: "taken > :zero",
                  ExpressionAttributeValues: { ":one": 1, ":zero": 0 },
                },
              },
            ],
          }),
        ),
      );
    } catch (err) {
      // Lost a race with payment or a duplicate expiry event: nothing to release.
      if ((err as { name?: string }).name === "TransactionCanceledException")
        return;
      throw err;
    }
  }

  async linkPaymentIntent(intentId: string, registrationId: string) {
    await this.db.send(new PutCommand({ TableName: this.table, Item: { pk: `PI#${intentId}`, sk: "PI", registrationId } }));
  }

  async refundByPaymentIntent(intentId: string) {
    const link = await this.db.send(new GetCommand({ TableName: this.table, Key: { pk: `PI#${intentId}`, sk: "PI" } }));
    const id = link.Item?.registrationId as string | undefined;
    const reg = id ? await this.get(id) : null;
    if (!reg || reg.status !== "paid") return false;
    try {
      await withConflictRetry(() =>
        this.db.send(
          new TransactWriteCommand({
            TransactItems: [
              {
                Update: {
                  TableName: this.table,
                  Key: { pk: `REG#${reg.id}`, sk: "REG" },
                  UpdateExpression: "SET #s = :refunded, refundedAt = :at",
                  ConditionExpression: "#s = :paid",
                  ExpressionAttributeNames: { "#s": "status" },
                  ExpressionAttributeValues: { ":refunded": "refunded", ":paid": "paid", ":at": new Date().toISOString() },
                },
              },
              {
                Update: {
                  TableName: this.table,
                  Key: { pk: `DAY#${reg.date}`, sk: `CLASS#${reg.classId}` },
                  UpdateExpression: "SET taken = taken - :one",
                  ConditionExpression: "taken > :zero",
                  ExpressionAttributeValues: { ":one": 1, ":zero": 0 },
                },
              },
            ],
          }),
        ),
      );
      return true;
    } catch (err) {
      if ((err as { name?: string }).name === "TransactionCanceledException") return false;
      throw err;
    }
  }

  async get(id: string) {
    const res = await this.db.send(
      new GetCommand({
        TableName: this.table,
        Key: { pk: `REG#${id}`, sk: "REG" },
      }),
    );
    return res.Item ? (strip(res.Item) as Registration) : null;
  }

  async setCheckedIn(id: string, checkedIn: boolean) {
    await this.db.send(
      new UpdateCommand({
        TableName: this.table,
        Key: { pk: `REG#${id}`, sk: "REG" },
        UpdateExpression: "SET checkedIn = :c",
        ConditionExpression: "#s = :paid",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":c": checkedIn, ":paid": "paid" },
      }),
    );
  }

  async listByDay(date: string) {
    const items: Registration[] = [];
    let start: Record<string, unknown> | undefined;
    do {
      const res = await this.db.send(
        new QueryCommand({
          TableName: this.table,
          IndexName: "gsi1",
          KeyConditionExpression: "gsi1pk = :pk",
          ExpressionAttributeValues: { ":pk": `DAY#${date}` },
          ExclusiveStartKey: start,
        }),
      );
      items.push(...(res.Items ?? []).map((i) => strip(i) as Registration));
      start = res.LastEvaluatedKey;
    } while (start);
    return items;
  }

  async spotsTaken(date: string) {
    const res = await this.db.send(
      new QueryCommand({
        TableName: this.table,
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :cls)",
        ExpressionAttributeValues: { ":pk": `DAY#${date}`, ":cls": "CLASS#" },
      }),
    );
    return Object.fromEntries(
      (res.Items ?? []).map((i) => [
        String(i.sk).slice(6),
        Number(i.taken ?? 0),
      ]),
    );
  }

  async putMembership(m: MembershipRecord) {
    try {
      await this.db.send(
        new PutCommand({
          TableName: this.table,
          Item: {
            pk: `MEM#${m.id}`,
            sk: "MEM",
            gsi1pk: "MEMBERS",
            gsi1sk: `${m.createdAt}#${m.id}`,
            ...m,
          },
          ConditionExpression: "attribute_not_exists(pk)",
        }),
      );
      return true;
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) return false;
      throw err;
    }
  }
}

function strip(item: Record<string, unknown> | undefined) {
  if (!item) return item;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pk, sk, gsi1pk, gsi1sk, ...rest } = item;
  return rest;
}

// ---------------------------------------------------------------------------
// In-memory (tests / local dev without AWS). Single-process only.

export class MemoryStore implements RegistrationStore {
  regs = new Map<string, Registration>();
  taken = new Map<string, number>();
  members = new Map<string, MembershipRecord>();

  async reserve(reg: Registration, capacity: number) {
    const key = `${reg.date}|${reg.classId}`;
    const n = this.taken.get(key) ?? 0;
    if (n >= capacity) throw new SoldOutError();
    this.taken.set(key, n + 1);
    this.regs.set(reg.id, { ...reg });
  }
  async attachSession(id: string, sessionId: string) {
    const r = this.regs.get(id);
    if (r) r.stripeSessionId = sessionId;
  }
  async markPaid(id: string, paidAt: string) {
    const r = this.regs.get(id);
    if (!r || r.status !== "pending") return null;
    r.status = "paid";
    r.paidAt = paidAt;
    return { ...r };
  }
  async release(id: string) {
    const r = this.regs.get(id);
    if (!r || r.status !== "pending") return;
    r.status = "expired";
    const key = `${r.date}|${r.classId}`;
    this.taken.set(key, Math.max(0, (this.taken.get(key) ?? 1) - 1));
  }
  intents = new Map<string, string>();
  async linkPaymentIntent(intentId: string, registrationId: string) {
    this.intents.set(intentId, registrationId);
  }
  async refundByPaymentIntent(intentId: string) {
    const r = this.regs.get(this.intents.get(intentId) ?? "");
    if (!r || r.status !== "paid") return false;
    r.status = "refunded";
    const key = `${r.date}|${r.classId}`;
    this.taken.set(key, Math.max(0, (this.taken.get(key) ?? 1) - 1));
    return true;
  }
  async get(id: string) {
    const r = this.regs.get(id);
    return r ? { ...r } : null;
  }
  async setCheckedIn(id: string, checkedIn: boolean) {
    const r = this.regs.get(id);
    if (r?.status === "paid") r.checkedIn = checkedIn;
  }
  async listByDay(date: string) {
    return [...this.regs.values()]
      .filter((r) => r.date === date)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  async spotsTaken(date: string) {
    const out: Record<string, number> = {};
    for (const [key, n] of this.taken) {
      const [d, c] = key.split("|");
      if (d === date) out[c] = n;
    }
    return out;
  }
  async putMembership(m: MembershipRecord) {
    if (this.members.has(m.id)) return false;
    this.members.set(m.id, m);
    return true;
  }
}

// Only the in-memory store is pinned to globalThis (so dev hot reloads keep its data).
// The DynamoDB store is stateless, so a module-level instance always matches current code.
const globalMemory = globalThis as unknown as { __martinMemoryStore?: MemoryStore };
let dynamo: DynamoStore | null = null;

export function getStore(): RegistrationStore {
  const table = process.env.MARTIN_TABLE;
  if (table) return (dynamo ??= new DynamoStore(table));
  return (globalMemory.__martinMemoryStore ??= new MemoryStore());
}
