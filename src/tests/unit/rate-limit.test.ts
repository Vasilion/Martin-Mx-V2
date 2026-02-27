import { describe, expect, it } from "vitest";
import { assertRateLimit } from "@/lib/forms/rate-limit";

describe("assertRateLimit", () => {
  it("allows requests under threshold", () => {
    const key = `key-${Math.random()}`;
    const first = assertRateLimit(key, 2, 10_000);
    const second = assertRateLimit(key, 2, 10_000);
    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
  });

  it("blocks requests over threshold", () => {
    const key = `key-${Math.random()}`;
    assertRateLimit(key, 1, 10_000);
    const second = assertRateLimit(key, 1, 10_000);
    expect(second.allowed).toBe(false);
    expect(second.retryAfterMs).toBeTypeOf("number");
  });
});
