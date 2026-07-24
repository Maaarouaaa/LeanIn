import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createSupabaseClientMock = vi.fn();

vi.mock("@/lib/supabase/server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase/server")>(
    "@/lib/supabase/server",
  );
  return {
    ...actual,
    createSupabaseClient: (...args: unknown[]) =>
      createSupabaseClientMock(...args),
  };
});

describe("repository selection", () => {
  beforeEach(() => {
    vi.resetModules();
    createSupabaseClientMock.mockReset();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SECRET_KEY;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("selects memoryStore when required Supabase env is missing", async () => {
    const { getDataStore, getDataMode, resetDataModeCache } = await import(
      "@/lib/data/store"
    );
    const { memoryStore } = await import("@/lib/data/memory");

    resetDataModeCache();
    const store = await getDataStore();
    const mode = await getDataMode();

    expect(store).toBe(memoryStore);
    expect(store.mode).toBe("memory");
    expect(mode).toBe("memory");
    expect(createSupabaseClientMock).not.toHaveBeenCalled();
  });

  it("selects supabaseStore when env is present and circles probe succeeds", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    createSupabaseClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          limit: async () => ({
            data: [{ id: "1", slug: "bay-area-leadership-lab" }],
            error: null,
          }),
        }),
      }),
    });

    const { getDataStore, getDataMode, resetDataModeCache } = await import(
      "@/lib/data/store"
    );
    const { supabaseStore } = await import("@/lib/data/supabase-store");

    resetDataModeCache();
    const store = await getDataStore();
    const mode = await getDataMode();

    expect(createSupabaseClientMock).toHaveBeenCalledTimes(1);
    expect(store).toBe(supabaseStore);
    expect(store.mode).toBe("supabase");
    expect(mode).toBe(store.mode);
  });

  it("falls back to memoryStore and logs when circles probe fails", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    createSupabaseClientMock.mockReturnValue({
      from: () => ({
        select: () => ({
          limit: async () => ({
            data: null,
            error: {
              message: "relation public.circles does not exist",
              code: "42P01",
            },
          }),
        }),
      }),
    });

    const { getDataStore, getDataMode, resetDataModeCache } = await import(
      "@/lib/data/store"
    );
    const { memoryStore } = await import("@/lib/data/memory");

    resetDataModeCache();
    const store = await getDataStore();
    const mode = await getDataMode();

    expect(store).toBe(memoryStore);
    expect(mode).toBe("memory");
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("falls back to memoryStore when client initialization throws", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    createSupabaseClientMock.mockImplementation(() => {
      throw new Error("invalid supabase key");
    });

    const { getDataStore, getDataMode, resetDataModeCache } = await import(
      "@/lib/data/store"
    );
    const { memoryStore } = await import("@/lib/data/memory");

    resetDataModeCache();
    const store = await getDataStore();
    const mode = await getDataMode();

    expect(store).toBe(memoryStore);
    expect(mode).toBe("memory");
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
