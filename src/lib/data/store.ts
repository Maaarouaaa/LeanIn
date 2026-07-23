import { memoryStore } from "@/lib/data/memory";
import { supabaseStore } from "@/lib/data/supabase-store";
import type { DataStore } from "@/lib/data/types";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export function getDataStore(): DataStore {
  if (hasSupabaseConfig()) {
    return supabaseStore;
  }
  return memoryStore;
}

export function getDataMode(): DataStore["mode"] {
  return getDataStore().mode;
}
