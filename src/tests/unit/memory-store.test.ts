import { describe, expect, it } from "vitest";
import { MemorySignupStore } from "@/lib/store/memory-store";

describe("memory signup store", () => {
  it("supports idempotent inserts", async () => {
    const store = new MemorySignupStore();
    const payload = {
      idempotencyKey: "same-key",
      referenceId: "ref-1",
      formType: "practice",
      payload: { riderFullName: "A" },
      createdAt: new Date().toISOString(),
    };

    const first = await store.putIfAbsent(payload);
    const second = await store.putIfAbsent({ ...payload, referenceId: "ref-2" });

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.existingReferenceId).toBe("ref-1");
  });

  it("decrements spot counters safely", async () => {
    const store = new MemorySignupStore();
    const value = await store.decrementSpotCounter("2026-03-01", "AB");
    expect(value).toBe(99);
  });

  it("filters signups by form type", async () => {
    const store = new MemorySignupStore();
    await store.putIfAbsent({
      idempotencyKey: "k1",
      referenceId: "ref-practice",
      formType: "practice-unique",
      payload: { riderFullName: "Practice Rider" },
      createdAt: new Date().toISOString(),
    });
    await store.putIfAbsent({
      idempotencyKey: "k2",
      referenceId: "ref-contact",
      formType: "contact",
      payload: { fullName: "Contact Person" },
      createdAt: new Date().toISOString(),
    });

    const filtered = await store.listSignups({ formType: "practice-unique" });
    expect(filtered.length).toBe(1);
    expect(filtered[0].referenceId).toBe("ref-practice");
  });
});
