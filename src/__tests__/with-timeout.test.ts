import { describe, expect, it, vi } from "vitest";
import {
  SUPABASE_QUERY_TIMEOUT_MS,
  TimeoutError,
  withTimeout,
} from "@/lib/with-timeout";

describe("withTimeout", () => {
  it("resolves when the promise finishes before the deadline", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 50)).resolves.toBe("ok");
  });

  it("rejects with TimeoutError when the deadline elapses", async () => {
    vi.useFakeTimers();
    const pending = withTimeout(
      new Promise(() => {}),
      10,
      "Supabase query timed out after 10 seconds.",
    );
    const assertion = expect(pending).rejects.toMatchObject({
      name: "TimeoutError",
      timedOut: true,
      message: "Supabase query timed out after 10 seconds.",
    });
    await vi.advanceTimersByTimeAsync(10);
    await assertion;
    vi.useRealTimers();
  });

  it("exports a 10 second Supabase query timeout", () => {
    expect(SUPABASE_QUERY_TIMEOUT_MS).toBe(10_000);
    expect(new TimeoutError().timedOut).toBe(true);
  });
});
