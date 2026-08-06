import { describe, expect, test, beforeEach } from 'vitest';
import {
  ConcurrencyLimiter,
  ConcurrencyLimitError,
  providerConcurrency,
  providerAcquireTimeoutMs,
} from '../../server/observability/concurrency';
import {
  SpendGuard,
  isProviderEnabled,
  loadPricing,
  loadSpendGuardOptions,
} from '../../server/observability/spend-guard';
import {
  ProviderGateError,
  gateSnapshot,
  resetProviderGate,
  runGuardedProviderCall,
} from '../../server/observability/provider-gate';
import { readJsonBody, maxBodyBytes, DEFAULT_MAX_BODY_BYTES } from '../../server/http/read-json-body';
import { MockProvider } from '../../server/reading-engine/providers/mock';
import { ClaudeProvider } from '../../server/reading-engine/providers/claude';
import type { InterpretationProvider } from '../../server/reading-engine/providers/types';
import { buildReadingLogRecord } from '../../server/observability/log';
import { generateInterpretedReading } from '../../server/reading-engine';
import { IntakeContextSchema } from '../../types/intake';

function testIntake() {
  return IntakeContextSchema.parse({
    questionDomain: 'career',
    persona: 'reflection-seeking',
    emotionalIntensity: 'low',
    decisionUrgency: 'low',
    spiritualPreference: 'balanced',
    responseDepth: 'standard',
    safetyFlags: [],
    confidence: 0.5,
  });
}

/* ------------------------------------------------------------------ *
 * Spend guard
 * ------------------------------------------------------------------ */

describe('H4 spend guard — daily ceilings', () => {
  test('allows calls under the caps', () => {
    const g = new SpendGuard({ maxTokensPerDay: 1000, maxCallsPerDay: 10 });
    expect(g.check(true).allowed).toBe(true);
  });

  test('blocks once the daily call cap is reached', () => {
    const g = new SpendGuard({ maxTokensPerDay: 1_000_000, maxCallsPerDay: 2 });
    g.record({ inputTokens: 1, outputTokens: 1 });
    g.record({ inputTokens: 1, outputTokens: 1 });
    const d = g.check(true);
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe('daily_call_cap_reached');
  });

  test('blocks once the daily token cap is reached', () => {
    const g = new SpendGuard({ maxTokensPerDay: 100, maxCallsPerDay: 1000 });
    g.record({ inputTokens: 60, outputTokens: 50 });
    const d = g.check(true);
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe('daily_token_cap_reached');
  });

  test('the kill switch blocks regardless of remaining budget', () => {
    const g = new SpendGuard({ maxTokensPerDay: 1_000_000, maxCallsPerDay: 1000 });
    const d = g.check(false);
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe('provider_disabled');
  });

  test('counters reset when the UTC day rolls over', () => {
    let now = Date.parse('2026-08-06T23:59:00Z');
    const g = new SpendGuard({ maxTokensPerDay: 100, maxCallsPerDay: 1, now: () => now });
    g.record({ inputTokens: 90, outputTokens: 20 });
    expect(g.check(true).allowed).toBe(false);

    now = Date.parse('2026-08-07T00:01:00Z');
    expect(g.check(true).allowed).toBe(true);
    expect(g.snapshot().totalTokens).toBe(0);
  });

  test('a failed call that consumed tokens still counts', () => {
    // Recording only on success would let a retry loop spend without ever
    // moving the tally.
    const g = new SpendGuard({ maxTokensPerDay: 1_000_000, maxCallsPerDay: 1000 });
    g.record({ inputTokens: 500, outputTokens: 0 });
    expect(g.snapshot().calls).toBe(1);
    expect(g.snapshot().totalTokens).toBe(500);
  });

  test('negative or missing usage cannot decrement the tally', () => {
    const g = new SpendGuard({ maxTokensPerDay: 1000, maxCallsPerDay: 10 });
    g.record({ inputTokens: -50, outputTokens: -50 });
    g.record(undefined);
    expect(g.snapshot().totalTokens).toBe(0);
    expect(g.snapshot().calls).toBe(2);
  });
});

describe('H4 spend guard — money is never invented', () => {
  test('no cost is reported when pricing is not configured', () => {
    const g = new SpendGuard({ maxTokensPerDay: 1000, maxCallsPerDay: 10 });
    g.record({ inputTokens: 1000, outputTokens: 1000 });
    // A guessed price would produce a confident, wrong number.
    expect(g.snapshot().estimatedCostUsd).toBeUndefined();
  });

  test('cost is reported only with fully attributed pricing', () => {
    const g = new SpendGuard({
      maxTokensPerDay: 10_000_000,
      maxCallsPerDay: 1000,
      pricing: {
        inputPerMillion: 3,
        outputPerMillion: 15,
        source: 'https://www.anthropic.com/pricing',
        verifiedOn: '2026-08-06',
      },
    });
    g.record({ inputTokens: 1_000_000, outputTokens: 1_000_000 });
    expect(g.snapshot().estimatedCostUsd).toBeCloseTo(18, 6);
  });

  test('partial pricing config is rejected outright, never half-applied', () => {
    // Prices with no recorded source or date are exactly the unattributed
    // numbers this module exists to avoid producing.
    expect(loadPricing({ ANTHROPIC_PRICE_INPUT_PER_MTOK: '3' })).toBeUndefined();
    expect(
      loadPricing({ ANTHROPIC_PRICE_INPUT_PER_MTOK: '3', ANTHROPIC_PRICE_OUTPUT_PER_MTOK: '15' })
    ).toBeUndefined();
    expect(
      loadPricing({
        ANTHROPIC_PRICE_INPUT_PER_MTOK: '3',
        ANTHROPIC_PRICE_OUTPUT_PER_MTOK: '15',
        ANTHROPIC_PRICE_SOURCE: 'x',
      })
    ).toBeUndefined();
  });

  test('a malformed verified-on date is rejected', () => {
    expect(
      loadPricing({
        ANTHROPIC_PRICE_INPUT_PER_MTOK: '3',
        ANTHROPIC_PRICE_OUTPUT_PER_MTOK: '15',
        ANTHROPIC_PRICE_SOURCE: 'https://example.com',
        ANTHROPIC_PRICE_VERIFIED_ON: 'last tuesday',
      })
    ).toBeUndefined();
  });

  test('a fully attributed pricing config is accepted', () => {
    const p = loadPricing({
      ANTHROPIC_PRICE_INPUT_PER_MTOK: '3',
      ANTHROPIC_PRICE_OUTPUT_PER_MTOK: '15',
      ANTHROPIC_PRICE_SOURCE: 'https://www.anthropic.com/pricing',
      ANTHROPIC_PRICE_VERIFIED_ON: '2026-08-06',
    });
    expect(p).toMatchObject({ inputPerMillion: 3, outputPerMillion: 15 });
  });

  test('a cost cap without pricing is ignored rather than guessed at', () => {
    const opts = loadSpendGuardOptions({ MAX_COST_USD_PER_DAY: '5' });
    expect(opts.maxCostUsdPerDay).toBeUndefined();
  });
});

describe('H4 kill switch configuration', () => {
  test('defaults to enabled so behaviour is unchanged until an operator acts', () => {
    expect(isProviderEnabled({})).toBe(true);
  });

  test.each(['0', 'false', 'FALSE'])('PROVIDER_ENABLED=%s disables the provider', (v) => {
    expect(isProviderEnabled({ PROVIDER_ENABLED: v })).toBe(false);
  });

  test('invalid numeric config falls back to the safe default, never to unbounded', () => {
    const opts = loadSpendGuardOptions({ MAX_TOKENS_PER_DAY: 'abc', MAX_PROVIDER_CALLS_PER_DAY: '-5' });
    expect(opts.maxTokensPerDay).toBeGreaterThan(0);
    expect(opts.maxCallsPerDay).toBeGreaterThan(0);
    expect(Number.isFinite(opts.maxTokensPerDay)).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * Concurrency
 * ------------------------------------------------------------------ */

describe('H4 concurrency limiter', () => {
  test('never runs more than `limit` tasks at once', async () => {
    const limiter = new ConcurrencyLimiter(3, 1000);
    let active = 0;
    let peak = 0;

    await Promise.all(
      Array.from({ length: 20 }, () =>
        limiter.run(async () => {
          active++;
          peak = Math.max(peak, active);
          await new Promise((r) => setTimeout(r, 5));
          active--;
        })
      )
    );

    expect(peak).toBeLessThanOrEqual(3);
    expect(active).toBe(0);
  });

  /**
   * A leaked permit is the classic deadlock for a limiter like this: `active`
   * never returns to zero and every later caller waits forever.
   */
  test('a throwing task releases its permit', async () => {
    const limiter = new ConcurrencyLimiter(1, 1000);
    await expect(limiter.run(async () => { throw new Error('boom'); })).rejects.toThrow('boom');
    expect(limiter.stats().active).toBe(0);
    await expect(limiter.run(async () => 'ok')).resolves.toBe('ok');
  });

  test('repeated failures cannot exhaust the pool', async () => {
    const limiter = new ConcurrencyLimiter(2, 1000);
    for (let i = 0; i < 20; i++) {
      await limiter.run(async () => { throw new Error('x'); }).catch(() => {});
    }
    expect(limiter.stats().active).toBe(0);
    expect(limiter.stats().queued).toBe(0);
  });

  test('rejects rather than queueing forever when saturated', async () => {
    const limiter = new ConcurrencyLimiter(1, 20);
    let release!: () => void;
    const held = limiter.run(() => new Promise<void>((r) => { release = r; }));

    await expect(limiter.run(async () => 'never')).rejects.toBeInstanceOf(ConcurrencyLimitError);

    release();
    await held;
    expect(limiter.stats().active).toBe(0);
  });

  test('a waiter that times out is removed from the queue', async () => {
    const limiter = new ConcurrencyLimiter(1, 10);
    let release!: () => void;
    const held = limiter.run(() => new Promise<void>((r) => { release = r; }));

    await expect(limiter.run(async () => 1)).rejects.toBeInstanceOf(ConcurrencyLimitError);
    expect(limiter.stats().queued).toBe(0);

    release();
    await held;
  });

  test('queued work proceeds once a slot frees', async () => {
    const limiter = new ConcurrencyLimiter(1, 1000);
    const order: number[] = [];
    const a = limiter.run(async () => { await new Promise((r) => setTimeout(r, 10)); order.push(1); });
    const b = limiter.run(async () => { order.push(2); });
    await Promise.all([a, b]);
    expect(order).toEqual([1, 2]);
    expect(limiter.stats().active).toBe(0);
  });

  test('config falls back to safe defaults on garbage input', () => {
    expect(providerConcurrency({ PROVIDER_MAX_CONCURRENCY: 'x' })).toBeGreaterThan(0);
    expect(providerAcquireTimeoutMs({ PROVIDER_ACQUIRE_TIMEOUT_MS: 'x' })).toBeGreaterThanOrEqual(0);
  });
});

/* ------------------------------------------------------------------ *
 * Provider gate
 * ------------------------------------------------------------------ */

describe('H4 provider gate', () => {
  beforeEach(() => {
    delete process.env.PROVIDER_ENABLED;
    delete process.env.MAX_TOKENS_PER_DAY;
    delete process.env.MAX_PROVIDER_CALLS_PER_DAY;
    resetProviderGate();
  });

  test('a permitted call runs and its usage is recorded', async () => {
    const before = gateSnapshot().calls;
    const result = await runGuardedProviderCall(
      async () => 'ok',
      () => ({ inputTokens: 10, outputTokens: 20 })
    );
    expect(result).toBe('ok');
    const snap = gateSnapshot();
    expect(snap.calls).toBe(before + 1);
    expect(snap.totalTokens).toBeGreaterThanOrEqual(30);
  });

  test('the kill switch blocks with a categorical reason and never calls the task', async () => {
    process.env.PROVIDER_ENABLED = '0';
    resetProviderGate();
    let called = false;
    await expect(
      runGuardedProviderCall(async () => { called = true; return 'x'; }, () => undefined)
    ).rejects.toMatchObject({ reason: 'provider-disabled' });
    expect(called).toBe(false);
  });

  test('the spend cap blocks with a categorical reason', async () => {
    process.env.MAX_PROVIDER_CALLS_PER_DAY = '1';
    resetProviderGate();
    await runGuardedProviderCall(async () => 'first', () => ({ inputTokens: 1, outputTokens: 1 }));
    await expect(
      runGuardedProviderCall(async () => 'second', () => undefined)
    ).rejects.toMatchObject({ reason: 'spend-cap-reached' });
  });

  test('a task error propagates but the call is still counted', async () => {
    resetProviderGate();
    const before = gateSnapshot().calls;
    await expect(
      runGuardedProviderCall(async () => { throw new Error('provider exploded'); }, () => undefined)
    ).rejects.toThrow('provider exploded');
    expect(gateSnapshot().calls).toBe(before + 1);
  });

  test('gate errors are ProviderGateError, distinguishable from provider failures', async () => {
    process.env.PROVIDER_ENABLED = 'false';
    resetProviderGate();
    await expect(runGuardedProviderCall(async () => 1, () => undefined)).rejects.toBeInstanceOf(
      ProviderGateError
    );
  });

  test('the snapshot carries no user text', () => {
    const serialized = JSON.stringify(gateSnapshot());
    expect(serialized).not.toMatch(/[çğışöü]/i);
    expect(gateSnapshot()).toHaveProperty('concurrency');
  });
});

/* ------------------------------------------------------------------ *
 * Provider cost marking
 * ------------------------------------------------------------------ */

describe('H4 — gating defaults to fail-safe', () => {
  test('MockProvider declares itself free so the fallback stays available', () => {
    // Gating the free fallback would turn a cost control into an outage at
    // exactly the moment the gate is what triggered the fallback.
    expect(new MockProvider().isFree).toBe(true);
  });

  test('ClaudeProvider does NOT declare itself free, so it is gated', () => {
    // The flag is spelled `isFree` precisely so this is the default: a new
    // paid provider that declares nothing is gated rather than silently
    // bypassing the spend ceiling.
    const provider: InterpretationProvider = new ClaudeProvider();
    expect(provider.isFree).toBeFalsy();
  });
});

/* ------------------------------------------------------------------ *
 * Body size cap
 * ------------------------------------------------------------------ */

function jsonRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request('https://example.com/api/readings', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body,
  });
}

describe('H4 body size cap', () => {
  test('accepts a normal body', async () => {
    const r = await readJsonBody(jsonRequest(JSON.stringify({ seed: 'a', question: 'merhaba' })));
    expect(r.ok).toBe(true);
    expect(r.value).toMatchObject({ seed: 'a' });
  });

  test('rejects a body over the ceiling', async () => {
    const huge = JSON.stringify({ seed: 'a', question: 'x'.repeat(200_000) });
    const r = await readJsonBody(jsonRequest(huge));
    expect(r.ok).toBe(false);
    expect(r.error).toBe('body_too_large');
  });

  test('an understated content-length does not get past the streamed count', async () => {
    // The declared length is a fast rejection, never the enforcement.
    const huge = JSON.stringify({ seed: 'a', question: 'x'.repeat(200_000) });
    const r = await readJsonBody(jsonRequest(huge, { 'content-length': '10' }));
    expect(r.ok).toBe(false);
    expect(r.error).toBe('body_too_large');
  });

  test('an overstated content-length is rejected before any body is read', async () => {
    const r = await readJsonBody(jsonRequest('{}', { 'content-length': String(10 * 1024 * 1024) }));
    expect(r.ok).toBe(false);
    expect(r.error).toBe('body_too_large');
  });

  test('malformed JSON is a parse error, not a size error', async () => {
    const r = await readJsonBody(jsonRequest('{ not json'));
    expect(r.ok).toBe(false);
    expect(r.error).toBe('invalid_json_body');
  });

  test('the cap falls back to a safe default on garbage config', () => {
    expect(maxBodyBytes({ MAX_BODY_BYTES: 'abc' })).toBe(DEFAULT_MAX_BODY_BYTES);
    expect(maxBodyBytes({ MAX_BODY_BYTES: '-1' })).toBe(DEFAULT_MAX_BODY_BYTES);
  });

  test('the cap is enforced ahead of the schema, not after it', async () => {
    // H1's 1000-char question limit only runs after the whole body is
    // buffered, so without this the oversized payload is already in memory.
    const huge = JSON.stringify({ seed: 'a', question: 'x'.repeat(100_000) });
    const r = await readJsonBody(jsonRequest(huge), 1024);
    expect(r.error).toBe('body_too_large');
    expect(r.value).toBeUndefined();
  });
});

/* ------------------------------------------------------------------ *
 * Log redaction with the new H4 fields
 * ------------------------------------------------------------------ */

describe('H4 — spend metrics never carry text', () => {
  test('the reading log record contains only numbers for the new fields', () => {
    const record = buildReadingLogRecord({
      requestId: 'req-1',
      status: 200,
      latencyMs: 12.7,
      outcome: 'reading',
      dailyProviderCalls: 5,
      dailyTotalTokens: 1234,
      estimatedCostUsd: 0.0123,
      providerConcurrencyActive: 2,
      providerConcurrencyQueued: 1,
    });
    for (const key of [
      'dailyProviderCalls',
      'dailyTotalTokens',
      'estimatedCostUsd',
      'providerConcurrencyActive',
      'providerConcurrencyQueued',
    ] as const) {
      expect(typeof record[key]).toBe('number');
    }
  });

  test('cost is omitted entirely rather than defaulted to zero', () => {
    // A zero would read as "this cost nothing", which is a claim. Absence
    // correctly reads as "we do not have attributed pricing".
    const record = buildReadingLogRecord({
      requestId: 'req-2',
      status: 200,
      latencyMs: 1,
      outcome: 'reading',
      dailyTotalTokens: 100,
    });
    expect('estimatedCostUsd' in record).toBe(false);
  });

  test('a user question still cannot reach the log record', () => {
    const record = buildReadingLogRecord({
      requestId: 'req-3',
      status: 200,
      latencyMs: 1,
      outcome: 'reading',
      persona: 'reflection-seeking',
      questionDomain: 'career',
      dailyTotalTokens: 10,
    });
    expect(JSON.stringify(record)).not.toContain('İşimde');
    expect(Object.keys(record)).not.toContain('question');
  });
});

/* ------------------------------------------------------------------ *
 * Found by red-teaming H4 itself
 * ------------------------------------------------------------------ */

describe('H4 red-team — zero must mean zero', () => {
  test('MAX_PROVIDER_CALLS_PER_DAY=0 blocks everything instead of using the default', () => {
    // The first implementation required a strictly positive number and
    // silently substituted the 2000-call default, so the most obvious way to
    // halt spending did the opposite of what it says.
    const opts = loadSpendGuardOptions({ MAX_PROVIDER_CALLS_PER_DAY: '0' });
    expect(opts.maxCallsPerDay).toBe(0);
    const g = new SpendGuard(opts);
    expect(g.check(true)).toMatchObject({ allowed: false, reason: 'daily_call_cap_reached' });
  });

  test('MAX_TOKENS_PER_DAY=0 blocks everything', () => {
    const opts = loadSpendGuardOptions({ MAX_TOKENS_PER_DAY: '0' });
    expect(opts.maxTokensPerDay).toBe(0);
    expect(new SpendGuard(opts).check(true).allowed).toBe(false);
  });

  test('negative and non-numeric values still fall back to the safe default', () => {
    expect(loadSpendGuardOptions({ MAX_PROVIDER_CALLS_PER_DAY: '-1' }).maxCallsPerDay).toBeGreaterThan(0);
    expect(loadSpendGuardOptions({ MAX_PROVIDER_CALLS_PER_DAY: 'abc' }).maxCallsPerDay).toBeGreaterThan(0);
  });
});

describe('H4 red-team — a closed gate never costs the user their reading', () => {
  /** A paid provider that would succeed if it were ever allowed to run. */
  class FakePaidProvider implements InterpretationProvider {
    readonly name = 'fake-paid';
    called = false;
    async generate(): Promise<never> {
      this.called = true;
      throw new Error('should not be reached');
    }
  }

  beforeEach(() => {
    delete process.env.PROVIDER_ENABLED;
    delete process.env.MAX_PROVIDER_CALLS_PER_DAY;
    resetProviderGate();
  });

  test('kill switch: reading still delivered, provider never called, reason is categorical', async () => {
    process.env.PROVIDER_ENABLED = '0';
    resetProviderGate();
    const provider = new FakePaidProvider();
    const result = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider,
    });
    expect(provider.called).toBe(false);
    expect(result.output.cards).toHaveLength(3);
    expect(result.providerUsed).toBe('mock');
    expect(result.fallbackReason).toBe('provider-disabled');
  });

  test('spend cap: reading still delivered with the spend-cap reason', async () => {
    process.env.MAX_PROVIDER_CALLS_PER_DAY = '0';
    resetProviderGate();
    const provider = new FakePaidProvider();
    const result = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider,
    });
    expect(provider.called).toBe(false);
    expect(result.output.cards).toHaveLength(3);
    expect(result.fallbackReason).toBe('spend-cap-reached');
  });
});
