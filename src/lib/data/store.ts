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

  resolvePromise = selectDataStore();
  return resolvePromise;
}

async function selectDataStore(): Promise<DataStore> {
  const envPresent = getSupabaseEnvPresence();
  console.info("[circle-match] Supabase env present:", envPresent);

  if (!hasRequiredSupabaseEnv()) {
    console.info(
      "[circle-match] repository adapter selected: memory (missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    );
    cachedStore = memoryStore;
    return cachedStore;
  }

  try {
    resetSupabaseClient();
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("circles")
      .select("id, slug")
      .limit(1);

    if (error) {
      logSupabaseError("Supabase circles probe failed", error);
      console.info(
        "[circle-match] repository adapter selected: memory (probe query failed)",
      );
      cachedStore = memoryStore;
      return cachedStore;
    }

    console.info("[circle-match] Supabase circles probe succeeded", {
      rowCount: data?.length ?? 0,
      sampleSlug: data?.[0]?.slug ?? null,
    });
    console.info("[circle-match] repository adapter selected: supabase");
    cachedStore = supabaseStore;
    return cachedStore;
  } catch (error) {
    console.error(
      "[circle-match] Supabase initialization error:",
      formatSupabaseError(error),
    );
    console.info(
      "[circle-match] repository adapter selected: memory (initialization threw)",
    );
    cachedStore = memoryStore;
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
