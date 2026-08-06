/**
 * Bounded concurrency for provider calls (H4).
 *
 * Without this, N simultaneous requests produce N simultaneous paid API calls.
 * Combined with the spend guard's up-front check, this also bounds how far the
 * daily cap can be overshot: at most `limit` calls can be in flight when the
 * ceiling is crossed.
 *
 * PROCESS-LOCAL, like the spend guard — see that module's note. This bounds
 * one instance, not a fleet.
 *
 * DESIGN CHOICE: reject rather than queue indefinitely.
 *
 * An unbounded queue converts a load spike into growing latency and then into
 * timeouts everywhere, which is worse for the user than a fast, honest
 * "busy" answer. A caller that cannot get a slot within `acquireTimeoutMs`
 * is refused, and the reading falls back to the deterministic path — the
 * user still gets a reading, just not a narrated one.
 */

export type ConcurrencyRejection = 'provider_busy';

export class ConcurrencyLimitError extends Error {
  readonly reason: ConcurrencyRejection = 'provider_busy';
  constructor(message: string) {
    super(message);
    this.name = 'ConcurrencyLimitError';
  }
}

interface Waiter {
  resolve: () => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
  settled: boolean;
}

export class ConcurrencyLimiter {
  private readonly limit: number;
  private readonly acquireTimeoutMs: number;
  private active = 0;
  private readonly waiters: Waiter[] = [];

  constructor(limit: number, acquireTimeoutMs: number) {
    this.limit = Math.max(1, Math.floor(limit));
    this.acquireTimeoutMs = Math.max(0, acquireTimeoutMs);
  }

  private acquire(): Promise<void> {
    if (this.active < this.limit) {
      this.active += 1;
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const waiter: Waiter = {
        settled: false,
        resolve,
        reject,
        timer: setTimeout(() => {
          if (waiter.settled) return;
          waiter.settled = true;
          const i = this.waiters.indexOf(waiter);
          if (i >= 0) this.waiters.splice(i, 1);
          reject(new ConcurrencyLimitError(`Timed out waiting ${this.acquireTimeoutMs}ms for a provider slot`));
        }, this.acquireTimeoutMs),
      };
      this.waiters.push(waiter);
    });
  }

  /**
   * Release exactly one slot.
   *
   * Always called from a `finally`, so a thrown or rejected task cannot leak a
   * permit. A leaked permit is the classic way a limiter like this deadlocks:
   * `active` never returns to 0 and every later caller waits forever.
   */
  private release(): void {
    const next = this.waiters.shift();
    if (next) {
      // Hand the permit directly to the next waiter; `active` stays the same.
      next.settled = true;
      clearTimeout(next.timer);
      next.resolve();
      return;
    }
    this.active = Math.max(0, this.active - 1);
  }

  /** Run `task` while holding a permit. Rejects with ConcurrencyLimitError on timeout. */
  async run<T>(task: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await task();
    } finally {
      this.release();
    }
  }

  /** Observability only — no user data. */
  stats(): { active: number; queued: number; limit: number } {
    return { active: this.active, queued: this.waiters.length, limit: this.limit };
  }
}

export const DEFAULT_PROVIDER_CONCURRENCY = 4;
export const DEFAULT_ACQUIRE_TIMEOUT_MS = 5_000;

export function providerConcurrency(env: Record<string, string | undefined> = process.env): number {
  const n = Number(env.PROVIDER_MAX_CONCURRENCY ?? DEFAULT_PROVIDER_CONCURRENCY);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_PROVIDER_CONCURRENCY;
}

export function providerAcquireTimeoutMs(env: Record<string, string | undefined> = process.env): number {
  const n = Number(env.PROVIDER_ACQUIRE_TIMEOUT_MS ?? DEFAULT_ACQUIRE_TIMEOUT_MS);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : DEFAULT_ACQUIRE_TIMEOUT_MS;
}
