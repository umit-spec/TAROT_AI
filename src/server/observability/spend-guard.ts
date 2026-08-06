/**
 * Provider spend guard (H4).
 *
 * Faz 0 measured an unbounded path to paid API calls: no body cap, no
 * concurrency bound, no daily ceiling, and no way to turn the provider off
 * without a redeploy. H1 capped the input size; this bounds how much can be
 * spent in aggregate and gives an operator a switch.
 *
 * ---
 *
 * HONEST LIMITATION, STATED UP FRONT
 *
 * This counter is PROCESS-LOCAL. On a serverless platform each instance keeps
 * its own tally, so the effective ceiling is (cap x instance count), not
 * (cap). It is a guard against runaway usage, NOT a billing control, and it
 * must never be described as one.
 *
 * A true global ceiling needs shared state (Postgres/Upstash/Redis) and is
 * deferred with persistence — the same deferral already recorded for the rate
 * limiter. Until then, the provider-side spend limit configured in the
 * Anthropic console is the only hard ceiling, and it should be set.
 *
 * ---
 *
 * WHY TOKENS AND NOT MONEY BY DEFAULT
 *
 * Tokens are counted from the provider's own usage response, so they need no
 * external assumption. Converting them to money requires per-model prices,
 * which change and which this repository has no verified record of. Inventing
 * a price to display a dollar figure would produce a confident, wrong number.
 *
 * Cost accounting is therefore OPT-IN: it activates only when prices are
 * configured explicitly, together with the source and date they came from
 * (see `PricingConfig`). With no configured pricing, the guard still works —
 * it just counts tokens and calls.
 */

export type SpendBlockReason =
  | 'provider_disabled'
  | 'daily_token_cap_reached'
  | 'daily_call_cap_reached'
  | 'daily_cost_cap_reached';

export interface PricingConfig {
  /** USD per 1M input tokens. */
  inputPerMillion: number;
  /** USD per 1M output tokens. */
  outputPerMillion: number;
  /** Where these numbers came from. Required — no anonymous prices. */
  source: string;
  /** ISO date the prices were verified. Required. */
  verifiedOn: string;
}

export interface SpendGuardOptions {
  maxTokensPerDay: number;
  maxCallsPerDay: number;
  /** Only meaningful when pricing is configured. */
  maxCostUsdPerDay?: number;
  pricing?: PricingConfig;
  /** Injectable for tests. */
  now?: () => number;
}

export interface SpendDecision {
  allowed: boolean;
  reason?: SpendBlockReason;
}

export interface SpendSnapshot {
  day: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  /** Undefined unless pricing is configured. Never a guessed number. */
  estimatedCostUsd?: number;
}

function utcDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export class SpendGuard {
  private readonly opts: Required<Pick<SpendGuardOptions, 'maxTokensPerDay' | 'maxCallsPerDay'>> &
    SpendGuardOptions;
  private readonly now: () => number;

  private day: string;
  private calls = 0;
  private inputTokens = 0;
  private outputTokens = 0;

  constructor(options: SpendGuardOptions) {
    this.opts = options as SpendGuard['opts'];
    this.now = options.now ?? Date.now;
    this.day = utcDay(this.now());
  }

  /** Reset counters when the UTC day rolls over. */
  private rollIfNeeded(): void {
    const today = utcDay(this.now());
    if (today !== this.day) {
      this.day = today;
      this.calls = 0;
      this.inputTokens = 0;
      this.outputTokens = 0;
    }
  }

  private costUsd(): number | undefined {
    const p = this.opts.pricing;
    if (!p) return undefined;
    return (
      (this.inputTokens / 1_000_000) * p.inputPerMillion +
      (this.outputTokens / 1_000_000) * p.outputPerMillion
    );
  }

  /**
   * Checked BEFORE a provider call.
   *
   * Deliberately conservative: the check happens up front, so the cap can be
   * exceeded by at most the tokens of calls already in flight. Bounding that
   * overshoot is what the concurrency limiter is for — the two work together.
   */
  check(providerEnabled: boolean): SpendDecision {
    this.rollIfNeeded();

    if (!providerEnabled) return { allowed: false, reason: 'provider_disabled' };
    if (this.calls >= this.opts.maxCallsPerDay) {
      return { allowed: false, reason: 'daily_call_cap_reached' };
    }
    if (this.inputTokens + this.outputTokens >= this.opts.maxTokensPerDay) {
      return { allowed: false, reason: 'daily_token_cap_reached' };
    }

    const cost = this.costUsd();
    if (this.opts.maxCostUsdPerDay !== undefined && cost !== undefined && cost >= this.opts.maxCostUsdPerDay) {
      return { allowed: false, reason: 'daily_cost_cap_reached' };
    }

    return { allowed: true };
  }

  /**
   * Recorded AFTER a call, whether or not it succeeded. A failed call that
   * still consumed tokens must count, or a retry loop could spend without
   * ever incrementing the tally.
   */
  record(usage: { inputTokens?: number; outputTokens?: number } | undefined): void {
    this.rollIfNeeded();
    this.calls += 1;
    this.inputTokens += Math.max(0, usage?.inputTokens ?? 0);
    this.outputTokens += Math.max(0, usage?.outputTokens ?? 0);
  }

  snapshot(): SpendSnapshot {
    this.rollIfNeeded();
    const cost = this.costUsd();
    return {
      day: this.day,
      calls: this.calls,
      inputTokens: this.inputTokens,
      outputTokens: this.outputTokens,
      totalTokens: this.inputTokens + this.outputTokens,
      ...(cost === undefined ? {} : { estimatedCostUsd: Number(cost.toFixed(6)) }),
    };
  }

  /** Test-only. */
  reset(): void {
    this.calls = 0;
    this.inputTokens = 0;
    this.outputTokens = 0;
    this.day = utcDay(this.now());
  }
}

/* ------------------------------------------------------------------ *
 * Configuration
 * ------------------------------------------------------------------ */

export const DEFAULT_MAX_TOKENS_PER_DAY = 1_000_000;
export const DEFAULT_MAX_CALLS_PER_DAY = 2_000;

/**
 * The kill switch. Default ON so behaviour is unchanged unless an operator
 * turns it off; setting PROVIDER_ENABLED to '0' or 'false' stops every
 * provider call immediately, with no redeploy and no code change.
 */
export function isProviderEnabled(env: Record<string, string | undefined> = process.env): boolean {
  const raw = env.PROVIDER_ENABLED;
  if (raw === undefined) return true;
  return raw !== '0' && raw.toLowerCase() !== 'false';
}

/**
 * ZERO IS A VALID, MEANINGFUL VALUE — it means "allow nothing".
 *
 * An earlier version required a strictly positive number and silently
 * substituted the default otherwise. That made `MAX_PROVIDER_CALLS_PER_DAY=0`
 * — the most obvious way an operator would try to halt all spending — resolve
 * to the 2000-call default instead. A cost control that quietly ignores
 * "spend nothing" is worse than none.
 *
 * Only negative, non-numeric, or absent values fall back to the default.
 */
function nonNegativeIntOr(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

/**
 * Pricing from env, all-or-nothing.
 *
 * A partial configuration is REJECTED rather than half-applied: prices with
 * no recorded source or date are exactly the kind of unattributed number this
 * module exists to avoid producing.
 */
export function loadPricing(env: Record<string, string | undefined> = process.env): PricingConfig | undefined {
  const input = env.ANTHROPIC_PRICE_INPUT_PER_MTOK;
  const output = env.ANTHROPIC_PRICE_OUTPUT_PER_MTOK;
  const source = env.ANTHROPIC_PRICE_SOURCE;
  const verifiedOn = env.ANTHROPIC_PRICE_VERIFIED_ON;

  if (!input || !output || !source || !verifiedOn) return undefined;

  const inputPerMillion = Number(input);
  const outputPerMillion = Number(output);
  if (!Number.isFinite(inputPerMillion) || !Number.isFinite(outputPerMillion)) return undefined;
  if (inputPerMillion < 0 || outputPerMillion < 0) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(verifiedOn)) return undefined;

  return { inputPerMillion, outputPerMillion, source, verifiedOn };
}

export function loadSpendGuardOptions(
  env: Record<string, string | undefined> = process.env
): SpendGuardOptions {
  const pricing = loadPricing(env);
  const maxCostRaw = env.MAX_COST_USD_PER_DAY;
  const maxCostUsdPerDay =
    pricing && maxCostRaw !== undefined && Number.isFinite(Number(maxCostRaw))
      ? Number(maxCostRaw)
      : undefined;

  return {
    maxTokensPerDay: nonNegativeIntOr(env.MAX_TOKENS_PER_DAY, DEFAULT_MAX_TOKENS_PER_DAY),
    maxCallsPerDay: nonNegativeIntOr(env.MAX_PROVIDER_CALLS_PER_DAY, DEFAULT_MAX_CALLS_PER_DAY),
    ...(maxCostUsdPerDay === undefined ? {} : { maxCostUsdPerDay }),
    ...(pricing === undefined ? {} : { pricing }),
  };
}
