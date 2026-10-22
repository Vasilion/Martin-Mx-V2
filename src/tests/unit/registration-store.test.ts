// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { MemoryStore, SoldOutError } = await import("@/lib/registrations/store");

const reg = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  status: "pending" as const,
  amount: 40,
  createdAt: new Date().toISOString(),
  date: "2099-06-01",
  classId: "C",
  firstName: "A",
  lastName: "B",
  email: "a@b.co",
  phone: "6165550100",
  riderNumber: "1",
  bikeSize: 250,
  ageGroup: "adult" as const,
  ...over,
});

describe("MemoryStore (mirrors the DynamoDB contract)", () => {
  it("refuses reservations past capacity", async () => {
    const s = new MemoryStore();
    await s.reserve(reg("1"), 2);
    await s.reserve(reg("2"), 2);
    await expect(s.reserve(reg("3"), 2)).rejects.toBeInstanceOf(SoldOutError);
    expect(await s.spotsTaken("2099-06-01")).toEqual({ C: 2 });
  });

  it("release frees the spot once and never touches paid registrations", async () => {
    const s = new MemoryStore();
    await s.reserve(reg("1"), 1);
    await s.release("1");
    await s.release("1");
    expect(await s.spotsTaken("2099-06-01")).toEqual({ C: 0 });

    await s.reserve(reg("2"), 1);
    expect(await s.markPaid("2", "now")).not.toBeNull();
    await s.release("2");
    expect((await s.get("2"))?.status).toBe("paid");
    expect(await s.spotsTaken("2099-06-01")).toEqual({ C: 1 });
  });

  it("markPaid only succeeds once (webhook retries are no-ops)", async () => {
    const s = new MemoryStore();
    await s.reserve(reg("1"), 5);
    expect(await s.markPaid("1", "t1")).not.toBeNull();
    expect(await s.markPaid("1", "t2")).toBeNull();
  });

  it("an expired hold can't be paid later", async () => {
    const s = new MemoryStore();
    await s.reserve(reg("1"), 5);
    await s.release("1");
    expect(await s.markPaid("1", "t")).toBeNull();
  });

  it("a full refund takes the rider off and frees the spot, once", async () => {
    const s = new MemoryStore();
    await s.reserve(reg("1"), 1);
    await s.markPaid("1", "t");
    await s.linkPaymentIntent("pi_1", "1");
    expect(await s.refundByPaymentIntent("pi_1")).toBe(true);
    expect(await s.refundByPaymentIntent("pi_1")).toBe(false);
    expect((await s.get("1"))?.status).toBe("refunded");
    expect(await s.spotsTaken("2099-06-01")).toEqual({ C: 0 });
  });

  it("membership writes once per Stripe session", async () => {
    const s = new MemoryStore();
    const m = { id: "cs_1", name: "M", email: "m@x.co", amount: 750, year: 2026, stripeSessionId: "cs_1", createdAt: "t" };
    expect(await s.putMembership(m)).toBe(true);
    expect(await s.putMembership(m)).toBe(false);
  });
});
