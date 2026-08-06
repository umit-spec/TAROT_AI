/**
 * The single gate every paid provider call passes through (H4).
 *
 * Combines the kill switch, the daily spend ceiling, and the concurrency
 * bound into one decision point, so there is exactly one place to reason
 * about "may we spend money right now" instead of three checks scattered
 * across call sites that could drift apart.
 *
 * Blocking here is NOT an error. The reading still happens — it falls back to
 * the deterministic path with a categorical reason, so the user gets a
 * reading and the operator gets a countable signal.
 *
 * Both counters are PROCESS-LOCAL. See spend-guard.ts for why that is a guard
 * and not a billing control.
 */

import { ConcurrencyLimiter, providerAcquireTimeoutMs, providerConcurrency } from './concurrency';
import { SpendGuard, isProviderEnabled, loadSpendGuardOptions, type SpendSnapshot } from './spend-guard';
import type { FallbackReason } from '../../types/evaluation';

export type GateBlockReason = Extract<
  FallbackReason,
  'provider-disabled' | 'spend-cap-reached' | 'provider-busy'
>;

export class ProviderGateError extends Error {
  constructor(readonly reason: GateBlockReason, message: string) {
    super(message);
    this.name = 'ProviderGateError';
  }
}

let spendGuard: SpendGuard | null = null;
let limiter: ConcurrencyLimiter | null = null;

function getSpendGuard(): SpendGuard {
  spendGuard ??= new SpendGuard(loadSpendGuardOptions());
  return spendGuard;
}

function getLimiter(): ConcurrencyLimiter {
  limiter ??= new ConcurrencyLimiter(providerConcurrency(), providerAcquireTimeoutMs());
  return limiter;
}

/**
 * Run a provider call under the gate.
 *
 * Order is deliberate:
 *  1. kill switch and spend ceiling — cheap, and refuse before queueing;
 *  2. concurrency slot — only worth waiting for if we are allowed to spend;
 *  3. usage recorded in `finally`, so a call that threw after consuming
 *     tokens still counts. Recording only on success would let a retry loop
 *     spend without ever moving the tally.
 */
export async function runGuardedProviderCall<T>(
  task: () => Promise<T>,
  readUsage: (result: T | undefined) => { inputTokens?: number; outputTokens?: number } | undefined
): Promise<T> {
  const guard = getSpendGuard();
  const decision = guard.check(isProviderEnabled());

  if (!decision.allowed) {
    const reason: GateBlockReason =
      decision.reason === 'provider_disabled' ? 'provider-disabled' : 'spend-cap-reached';
    throw new ProviderGateError(reason, `Provider call blocked: ${decision.reason}`);
  }

  let result: T | undefined;
  let called = false;
  try {
    return await getLimiter().run(async () => {
      called = true;
      result = await task();
      return result;
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'ConcurrencyLimitError') {
      // Never reached the provider, so nothing was spent and nothing is
      // recorded - this is load shedding, not a failed call.
      throw new ProviderGateError('provider-busy', 'Provider call blocked: no free slot');
    }
    throw err;
  } finally {
    if (called) guard.record(readUsage(result));
  }
}

export function gateSnapshot(): SpendSnapshot & { concurrency: ReturnType<ConcurrencyLimiter['stats']> } {
  return { ...getSpendGuard().snapshot(), concurrency: getLimiter().stats() };
}

/** Test-only: rebuild both from current env. */
export function resetProviderGate(): void {
  spendGuard = null;
  limiter = null;
}
