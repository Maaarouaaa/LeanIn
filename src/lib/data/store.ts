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

let cachedMode: DataMode | null = null;
let resolvePromise: Promise<DataMode> | null = null;

/**
 * Trace:
 * layout.tsx -> getDataMode()/resolveDataMode()
 * actions/API -> getDataStore() -> resolveDataMode()
 * resolveDataMode() checks env, probes public.circles, then selects adapter.
 */
export async function resolveDataMode(): Promise<DataMode> {
  if (cachedMode) return cachedMode;
  if (resolvePromise) return resolvePromise;

  resolvePromise = (async () => {
    const envPresent = getSupabaseEnvPresence();
    console.info("[circle-match] Supabase env present:", envPresent);

    if (!hasRequiredSupabaseEnv()) {
      console.info(
        "[circle-match] repository adapter selected: memory (missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
      );
      cachedMode = "memory";
      return cachedMode;
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
        cachedMode = "memory";
        return cachedMode;
      }

      console.info("[circle-match] Supabase circles probe succeeded", {
        rowCount: data?.length ?? 0,
        sampleSlug: data?.[0]?.slug ?? null,
      });
      console.info("[circle-match] repository adapter selected: supabase");
      cachedMode = "supabase";
      return cachedMode;
    } catch (error) {
      const formatted = formatSupabaseError(error);
      console.error(
        "[circle-match] Supabase initialization error:",
        formatted,
      );
      console.info(
        "[circle-match] repository adapter selected: memory (initialization threw)",
      );
      cachedMode = "memory";
      return cachedMode;
    }
  })();

  return resolvePromise;
}

export async function getDataStore(): Promise<DataStore> {
  const mode = await resolveDataMode();
  return mode === "supabase" ? supabaseStore : memoryStore;
}

export async function getDataMode(): Promise<DataMode> {
  return resolveDataMode();
}

/** Test helper — clears cached adapter selection. */
export function resetDataModeCache() {
  cachedMode = null;
  resolvePromise = null;
  resetSupabaseClient();
}
