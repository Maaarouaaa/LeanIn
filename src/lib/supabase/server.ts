import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getServerSupabaseKey,
  getSupabaseConfig,
} from "@/lib/supabase/config";

let client: SupabaseClient | null = null;

function formatSupabaseError(error: unknown): {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
} {
  if (error && typeof error === "object") {
    const record = error as {
      message?: string;
      code?: string;
      details?: string;
      hint?: string;
    };
    return {
      message: record.message ?? "Unknown Supabase error",
      code: record.code,
      details: record.details,
      hint: record.hint,
    };
  }
  return {
    message: error instanceof Error ? error.message : String(error),
  };
}

export function createSupabaseClient(): SupabaseClient {
  const config = getSupabaseConfig();
  const key = getServerSupabaseKey();
  if (!config || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createClient(config.url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient();
  }
  return client;
}

export function resetSupabaseClient() {
  client = null;
}

export function logSupabaseError(context: string, error: unknown) {
  const formatted = formatSupabaseError(error);
  console.error(`[circle-match] ${context}`, formatted);
}

export { formatSupabaseError };
