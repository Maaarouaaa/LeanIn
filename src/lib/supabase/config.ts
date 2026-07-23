/**
 * Runtime env helpers for Supabase.
 *
 * Required for adapter selection:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Optional server write key (preferred when present):
 * - SUPABASE_SERVICE_ROLE_KEY (legacy name in .env.example)
 * - SUPABASE_SECRET_KEY (newer Supabase secret key name)
 */

export const SUPABASE_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
] as const;

export type SupabaseEnvKey = (typeof SUPABASE_ENV_KEYS)[number];

export type SupabaseEnvPresence = Record<SupabaseEnvKey, boolean>;

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getSupabaseEnvPresence(): SupabaseEnvPresence {
  return {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(readEnv("NEXT_PUBLIC_SUPABASE_URL")),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(
      readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    ),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(readEnv("SUPABASE_SERVICE_ROLE_KEY")),
    SUPABASE_SECRET_KEY: Boolean(readEnv("SUPABASE_SECRET_KEY")),
  };
}

export function hasRequiredSupabaseEnv(): boolean {
  const presence = getSupabaseEnvPresence();
  return (
    presence.NEXT_PUBLIC_SUPABASE_URL && presence.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** @deprecated Use hasRequiredSupabaseEnv */
export function hasSupabaseConfig(): boolean {
  return hasRequiredSupabaseEnv();
}

export function getSupabaseConfig() {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceRoleKey =
    readEnv("SUPABASE_SERVICE_ROLE_KEY") || readEnv("SUPABASE_SECRET_KEY");

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey, serviceRoleKey };
}

export function getServerSupabaseKey(): string | null {
  const config = getSupabaseConfig();
  if (!config) return null;
  // Prefer secret/service-role for server-side writes; fall back to publishable/anon.
  return config.serviceRoleKey ?? config.anonKey;
}
