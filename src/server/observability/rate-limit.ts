/**
 * Fixed-window in-memory rate limiter (Sprint S3). Abuse prevention on the
 * single product endpoint. In-memory is a documented MVP limitation: it is
 * per-instance, so a durable/shared store (Postgres/Upstash) is deferred to
 * when persistence lands (S4). Not a silent gap - stated in the S3 evidence.
 */

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

export class RateLimiter {
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly hits = new Map<string, { count: number; windowStart: number }>();

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(key: string, now: number = Date.now()): RateLimitDecision {
    const entry = this.hits.get(key);
    if (!entry || now - entry.windowStart >= this.windowMs) {
      this.hits.set(key, { count: 1, windowStart: now });
      return { allowed: true, remaining: this.limit - 1, resetInMs: this.windowMs };
    }
    const resetInMs = this.windowMs - (now - entry.windowStart);
    if (entry.count >= this.limit) {
      return { allowed: false, remaining: 0, resetInMs };
    }
    entry.count += 1;
    return { allowed: true, remaining: this.limit - entry.count, resetInMs };
  }

  reset(): void {
    this.hits.clear();
  }
}

/**
 * Enabled only in production or when explicitly turned on (staging sets
 * RATE_LIMIT_ENABLED=1). OFF by default in dev/test so the existing route
 * tests never trip it and no shared state leaks across tests.
 */
export function isRateLimitEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.NODE_ENV === 'production' || env.RATE_LIMIT_ENABLED === '1';
}

export function rateLimitPerMinute(env: Record<string, string | undefined> = process.env): number {
  const n = Number(env.RATE_LIMIT_PER_MINUTE ?? '30');
  return Number.isFinite(n) && n > 0 ? n : 30;
}

/**
 * Preview has its OWN threshold (docs/ADR-UX-FRAMING-PREVIEW.md R11), NOT a
 * copy of the reading limit: the normal compose -> preview -> edit ->
 * re-preview loop means several preview calls per reading, so the default is
 * deliberately higher than the reading limit. Still bounded, so abuse is
 * blocked. Configured independently via PREVIEW_RATE_LIMIT_PER_MINUTE.
 */
export function previewRateLimitPerMinute(env: Record<string, string | undefined> = process.env): number {
  const n = Number(env.PREVIEW_RATE_LIMIT_PER_MINUTE ?? '60');
  return Number.isFinite(n) && n > 0 ? n : 60;
}

export function clientKey(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
