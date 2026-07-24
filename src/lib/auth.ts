import { DEMO_AUTH_COOKIE, DEMO_PROFILE_ID } from "@/lib/constants";
import { cookies } from "next/headers";

/**
 * Lightweight demo authentication.
 * Middleware provisions the demo member cookie; this helper reads it.
 * Structured so a real auth provider can replace this later.
 */
export async function requireAuthenticatedMember(): Promise<string> {
  const jar = await cookies();
  return jar.get(DEMO_AUTH_COOKIE)?.value ?? DEMO_PROFILE_ID;
}

export async function getAuthenticatedMemberId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(DEMO_AUTH_COOKIE)?.value ?? null;
}
