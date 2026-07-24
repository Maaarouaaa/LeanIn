/**
 * Development-only diagnostics. Never logs secret values.
 * Production builds stay quiet except for intentional console.error paths.
 */
export function debugLog(message: string, extra?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "development") return;
  if (extra) {
    console.info(message, extra);
  } else {
    console.info(message);
  }
}
