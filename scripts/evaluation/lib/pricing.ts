/**
 * Model pricing for the live-evaluation cost calculator. Kept as data, not
 * hardcoded into the cost script, so an ANTHROPIC_MODEL override still gets a
 * correct rate. Rates are USD per 1,000,000 tokens, sourced from the published
 * Anthropic pricing at implementation time (Sprint S2, 2026-07-23). If a model
 * is not in this table the cost tool reports the model as unpriced rather than
 * guessing.
 */
export interface ModelRate {
  inputPerMillion: number;
  outputPerMillion: number;
  /** Optional time-limited introductory pricing. */
  intro?: {
    inputPerMillion: number;
    outputPerMillion: number;
    /** Inclusive last date the intro rate applies (YYYY-MM-DD, UTC). */
    until: string;
  };
}

export const MODEL_RATES: Record<string, ModelRate> = {
  'claude-sonnet-5': {
    inputPerMillion: 3.0,
    outputPerMillion: 15.0,
    intro: { inputPerMillion: 2.0, outputPerMillion: 10.0, until: '2026-08-31' },
  },
  'claude-opus-4-8': { inputPerMillion: 5.0, outputPerMillion: 25.0 },
  'claude-opus-4-7': { inputPerMillion: 5.0, outputPerMillion: 25.0 },
  'claude-haiku-4-5': { inputPerMillion: 1.0, outputPerMillion: 5.0 },
  'claude-sonnet-4-6': { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  'claude-fable-5': { inputPerMillion: 10.0, outputPerMillion: 50.0 },
};

export interface CostResult {
  modelKnown: boolean;
  rateApplied: 'standard' | 'introductory' | 'unknown';
  inputPerMillion: number | null;
  outputPerMillion: number | null;
  inputCostUsd: number | null;
  outputCostUsd: number | null;
  totalCostUsd: number | null;
}

/**
 * Computes USD cost from token counts. `runDateIso` selects the introductory
 * rate when the run happened on/before the intro `until` date. Everything is
 * derived, secret-free, and reproducible.
 */
export function computeCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  runDateIso: string,
): CostResult {
  const rate = MODEL_RATES[model];
  if (!rate) {
    return {
      modelKnown: false,
      rateApplied: 'unknown',
      inputPerMillion: null,
      outputPerMillion: null,
      inputCostUsd: null,
      outputCostUsd: null,
      totalCostUsd: null,
    };
  }

  const runDay = runDateIso.slice(0, 10);
  const useIntro = rate.intro !== undefined && runDay <= rate.intro.until;
  const inputPerMillion = useIntro ? rate.intro!.inputPerMillion : rate.inputPerMillion;
  const outputPerMillion = useIntro ? rate.intro!.outputPerMillion : rate.outputPerMillion;

  const inputCostUsd = (inputTokens / 1_000_000) * inputPerMillion;
  const outputCostUsd = (outputTokens / 1_000_000) * outputPerMillion;

  return {
    modelKnown: true,
    rateApplied: useIntro ? 'introductory' : 'standard',
    inputPerMillion,
    outputPerMillion,
    inputCostUsd,
    outputCostUsd,
    totalCostUsd: inputCostUsd + outputCostUsd,
  };
}
