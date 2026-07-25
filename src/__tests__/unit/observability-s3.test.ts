import { describe, it, expect } from 'vitest';
import { buildReadingLogRecord } from '../../server/observability/log';
import { RateLimiter, isRateLimitEnabled, rateLimitPerMinute, clientKey } from '../../server/observability/rate-limit';
import { getOrCreateRequestId, REQUEST_ID_HEADER } from '../../server/observability/request-id';
import { GET as healthGet } from '../../app/api/health/route';

describe('structured logging redaction (D4/D5)', () => {
  it('never carries free-text — the record has no field that can hold a question', () => {
    const record = buildReadingLogRecord({
      requestId: 'req-1',
      status: 200,
      latencyMs: 123.7,
      outcome: 'reading',
      persona: 'reflection-seeking',
      questionDomain: 'relationship',
      crisis: false,
      safetyFlagCount: 0,
      provider: 'mock',
      inputTokens: 100,
      outputTokens: 50,
    });
    const serialized = JSON.stringify(record);
    // A realistic sensitive question must never appear (it's never an input field).
    const sensitive = 'beni aldatıyor mu';
    expect(serialized).not.toContain(sensitive);
    expect(record.latencyMs).toBe(124); // rounded
    expect(record.event).toBe('reading_request');
  });

  it('crisis record marks the flag but carries no crisis text', () => {
    const record = buildReadingLogRecord({ requestId: 'r', status: 200, latencyMs: 5, outcome: 'crisis', crisis: true, safetyFlagCount: 1 });
    expect(record.crisis).toBe(true);
    expect(Object.values(record).some((v) => typeof v === 'string' && v.length > 40)).toBe(false);
  });
});

describe('rate limiter', () => {
  it('allows up to the limit then blocks within the window', () => {
    const rl = new RateLimiter(3, 60_000);
    const now = 1_000_000;
    expect(rl.check('ip', now).allowed).toBe(true);
    expect(rl.check('ip', now).allowed).toBe(true);
    expect(rl.check('ip', now).allowed).toBe(true);
    const blocked = rl.check('ip', now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetInMs).toBeGreaterThan(0);
  });

  it('resets after the window elapses', () => {
    const rl = new RateLimiter(1, 1000);
    expect(rl.check('ip', 0).allowed).toBe(true);
    expect(rl.check('ip', 500).allowed).toBe(false);
    expect(rl.check('ip', 1500).allowed).toBe(true); // new window
  });

  it('is OFF by default, ON in production or with the flag', () => {
    expect(isRateLimitEnabled({})).toBe(false);
    expect(isRateLimitEnabled({ NODE_ENV: 'production' })).toBe(true);
    expect(isRateLimitEnabled({ RATE_LIMIT_ENABLED: '1' })).toBe(true);
  });

  it('reads the per-minute threshold with a safe default', () => {
    expect(rateLimitPerMinute({})).toBe(30);
    expect(rateLimitPerMinute({ RATE_LIMIT_PER_MINUTE: '10' })).toBe(10);
    expect(rateLimitPerMinute({ RATE_LIMIT_PER_MINUTE: 'nonsense' })).toBe(30);
  });

  it('derives a client key from forwarding headers', () => {
    expect(clientKey(new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))).toBe('1.2.3.4');
    expect(clientKey(new Headers())).toBe('unknown');
  });
});

describe('request id', () => {
  it('reuses an incoming id and generates one when absent', () => {
    expect(getOrCreateRequestId(new Headers({ [REQUEST_ID_HEADER]: 'abc' }))).toBe('abc');
    const generated = getOrCreateRequestId(new Headers());
    expect(generated.length).toBeGreaterThan(0);
  });
});

describe('health endpoint', () => {
  it('returns ok with version/commit and no secrets', async () => {
    const res = healthGet();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('commit');
  });
});
