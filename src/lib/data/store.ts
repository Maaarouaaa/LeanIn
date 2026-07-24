import { memoryStore } from "@/lib/data/memory";
import { supabaseStore } from "@/lib/data/supabase-store";
import type { DataStore } from "@/lib/data/types";
import {
  getSupabaseEnvPresence,
  hasRequiredSupabaseEnv,
} from "@/lib/supabase/config";
import {
  createSupabaseClient,
  formatSupabaseError,
  logSupabaseError,
  resetSupabaseClient,
} from "@/lib/supabase/server";
import {
  SUPABASE_QUERY_TIMEOUT_MS,
  TimeoutError,
  withTimeout,
} from "@/lib/with-timeout";

type DataMode = DataStore["mode"];

let cachedStore: DataStore | null = null;
let resolvePromise: Promise<DataStore> | null = null;

/**
 * Single source of truth for repository selection.
 * getDataMode() always returns the `.mode` of the store returned here.
 */
export async function getDataStore(): Promise<DataStore> {
  if (cachedStore) return cachedStore;
  if (resolvePromise) return resolvePromise;

  resolvePromise = selectDataStore().finally(() => {
    // Allow a later retry only when selection failed to cache a store.
    if (!cachedStore) resolvePromise = null;
  });
  return resolvePromise;
}

async function selectDataStore(): Promise<DataStore> {
  const started = Date.now();
  console.info("[circle-match] stage:getDataStore start");
  const envPresent = getSupabaseEnvPresence();
  console.info("[circle-match] Supabase env present:", envPresent);

  if (!hasRequiredSupabaseEnv()) {
    console.info(
      "[circle-match] repository adapter selected: memory (missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    );
    cachedStore = memoryStore;
    console.info("[circle-match] stage:getDataStore end", {
      mode: cachedStore.mode,
      ms: Date.now() - started,
    });
    return cachedStore;
  }

  try {
    resetSupabaseClient();
    const supabase = createSupabaseClient();
    console.info("[circle-match] stage:supabase.circles.probe start");
    const { data, error } = await withTimeout(
      Promise.resolve(
        supabase.from("circles").select("id, slug").limit(1),
      ),
      SUPABASE_QUERY_TIMEOUT_MS,
      "Supabase probe timed out after 10 seconds.",
    );

    if (error) {
      logSupabaseError("Supabase circles probe failed", error);
      console.info(
        "[circle-match] repository adapter selected: memory (probe query failed)",
      );
      cachedStore = memoryStore;
      console.info("[circle-match] stage:getDataStore end", {
        mode: cachedStore.mode,
        ms: Date.now() - started,
      });
      return cachedStore;
    }

    console.info("[circle-match] stage:supabase.circles.probe end", {
      ok: true,
      rowCount: data?.length ?? 0,
      sampleSlug: data?.[0]?.slug ?? null,
    });
    console.info("[circle-match] repository adapter selected: supabase");
    cachedStore = supabaseStore;
    console.info("[circle-match] stage:getDataStore end", {
      mode: cachedStore.mode,
      ms: Date.now() - started,
    });
    return cachedStore;
  } catch (error) {
    if (error instanceof TimeoutError) {
      logSupabaseError("Supabase circles probe timed out", error);
      console.info(
        "[circle-match] repository adapter selected: memory (probe timed out)",
      );
    } else {
      console.error(
        "[circle-match] Supabase initialization error:",
        formatSupabaseError(error),
      );
      console.info(
        "[circle-match] repository adapter selected: memory (initialization threw)",
      );
    }
    cachedStore = memoryStore;
    console.info("[circle-match] stage:getDataStore end", {
      mode: cachedStore.mode,
      ms: Date.now() - started,
    });
    return cachedStore;
  }
}

/** Mode of the repository actually selected by getDataStore(). */
export async function getDataMode(): Promise<DataMode> {
  const store = await getDataStore();
  return store.mode;
}

/** Test helper — clears cached repository selection. */
export function resetDataModeCache() {
  cachedStore = null;
  resolvePromise = null;
  resetSupabaseClient();
}
