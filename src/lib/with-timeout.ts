export class TimeoutError extends Error {
  readonly timedOut = true as const;

  constructor(message = "The request timed out. Please try again.") {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Race a promise against a wall-clock timeout.
 * Does not cancel the underlying work; callers should still treat the result as terminal.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message?: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new TimeoutError(message ?? `Timed out after ${ms}ms`));
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export const SUPABASE_QUERY_TIMEOUT_MS = 10_000;
