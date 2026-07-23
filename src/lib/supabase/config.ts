/**
 * Runtime env helpers for Supabase.
 * Read through process.env at call time (not module init) so `next dev`
 * picks up `.env.local` after restart.
 */

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function hasSupabaseConfig(): boolean {
  return Boolean(
    readEnv("NEXT_PUBLIC_SUPABASE_URL") &&
      readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
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
