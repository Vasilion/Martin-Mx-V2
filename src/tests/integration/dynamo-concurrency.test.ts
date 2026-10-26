// @vitest-environment node
// Runs against a real table: MARTIN_TABLE_TEST=martin-mx npx vitest run src/tests/integration/dynamo-concurrency.test.ts
import { describe, expect, it, vi } from "vitest";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

vi.mock("server-only", () => ({}));
const table = process.env.MARTIN_TABLE_TEST;

describe.skipIf(!table)("DynamoDB spot reservation under concurrency", () => {
  it("sells exactly `capacity` spots when 12 riders hit checkout at once", async () => {
    process.env.MARTIN_TABLE = table;
    const { getStore, SoldOutError } = await import("@/lib/registrations/store");
    const store = getStore();
    const date = `2099-01-${String(new Date().getSeconds() % 28 + 1).padStart(2, "0")}`;
    const results = await Promise.allSettled(
      Array.from({ length: 12 }, (_, i) =>
        store.reserve(
          { id: crypto.randomUUID(), status: "pending", amount: 40, createdAt: new Date().toISOString(), date, classId: "AB", firstName: `R${i}`, lastName: "T", email: "t@t.co", phone: "6165550100", riderNumber: String(i), bikeSize: 250, ageGroup: "adult" },
          3,
        ),
      ),
    );
    const ok = results.filter((r) => r.status === "fulfilled").length;
    const soldOut = results.filter((r) => r.status === "rejected" && r.reason instanceof SoldOutError).length;
    const other = results.filter((r) => r.status === "rejected" && !(r.reason instanceof SoldOutError));
    expect(other.map((r) => String((r as PromiseRejectedResult).reason))).toEqual([]);
    expect(ok).toBe(3);
    expect(soldOut).toBe(9);
    expect(await store.spotsTaken(date)).toEqual({ AB: 3 });

    // cleanup
    const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));
    const regs = await db.send(new QueryCommand({ TableName: table, IndexName: "gsi1", KeyConditionExpression: "gsi1pk = :p", ExpressionAttributeValues: { ":p": `DAY#${date}` } }));
    for (const r of regs.Items ?? []) await db.send(new DeleteCommand({ TableName: table, Key: { pk: r.pk, sk: r.sk } }));
    await db.send(new DeleteCommand({ TableName: table, Key: { pk: `DAY#${date}`, sk: "CLASS#AB" } }));
  }, 30000);

  it("removing a paid rider frees the spot once; a later refund is a no-op", async () => {
    process.env.MARTIN_TABLE = table;
    const { getStore } = await import("@/lib/registrations/store");
    const store = getStore();
    const date = "2099-02-01";
    const id = crypto.randomUUID();
    const pi = `pi_test_${id}`;
    await store.reserve(
      { id, status: "pending", amount: 40, createdAt: new Date().toISOString(), date, classId: "C", firstName: "R", lastName: "T", email: "t@t.co", phone: "6165550100", riderNumber: "1", bikeSize: 250, ageGroup: "adult" },
      5,
    );
    await store.linkPaymentIntent(pi, id);
    await store.markPaid(id, new Date().toISOString());
    expect((await store.get(id))?.paymentIntentId).toBe(pi);
    expect(await store.removeRider(id)).toBe(true);
    expect(await store.removeRider(id)).toBe(false);
    expect(await store.refundByPaymentIntent(pi)).toBe(false);
    expect((await store.get(id))?.status).toBe("removed");
    expect(await store.spotsTaken(date)).toEqual({ C: 0 });

    const db = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-1" }));
    for (const Key of [{ pk: `REG#${id}`, sk: "REG" }, { pk: `PI#${pi}`, sk: "PI" }, { pk: `DAY#${date}`, sk: "CLASS#C" }]) {
      await db.send(new DeleteCommand({ TableName: table, Key }));
    }
  }, 30000);
});
