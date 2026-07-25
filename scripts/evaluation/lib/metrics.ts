import type { EvaluationCaseResult, EvaluationRunManifest, FallbackReason } from '../../../src/types/evaluation';

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.min(sortedValues.length - 1, Math.ceil((p / 100) * sortedValues.length) - 1);
  return sortedValues[Math.max(0, index)];
}

export function computeMetrics(
  results: EvaluationCaseResult[],
  meta: { runId: string; runAt: string; providerMode: 'mock' | 'live-anthropic'; model?: string }
): EvaluationRunManifest {
  // Crisis-gated cases never attempted narration - excluded from the
  // fallback-rate denominator, since "the gate correctly refused" isn't a
  // fallback in the same sense a red-line/schema/provider failure is.
  const narrationAttempts = results.filter((r) => r.providerUsed !== 'crisis-gate');
  const fallbacks = narrationAttempts.filter((r) => r.fallbackReason !== undefined);

  const fallbackRateByReason: Record<string, number> = {};
  const reasons: FallbackReason[] = ['red-line-rejected', 'schema-invalid', 'provider-error'];
  for (const reason of reasons) {
    const count = fallbacks.filter((r) => r.fallbackReason === reason).length;
    fallbackRateByReason[reason] = narrationAttempts.length > 0 ? count / narrationAttempts.length : 0;
  }

  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);

  return {
    runId: meta.runId,
    runAt: meta.runAt,
    providerMode: meta.providerMode,
    ...(meta.model ? { model: meta.model } : {}),
    caseCount: results.length,
    fallbackRate: narrationAttempts.length > 0 ? fallbacks.length / narrationAttempts.length : 0,
    fallbackRateByReason,
    latencyP50Ms: percentile(latencies, 50),
    latencyP95Ms: percentile(latencies, 95),
    totalInputTokens: results.reduce((sum, r) => sum + (r.usage?.inputTokens ?? 0), 0),
    totalOutputTokens: results.reduce((sum, r) => sum + (r.usage?.outputTokens ?? 0), 0),
    zeroToleranceViolationCount: results.reduce((sum, r) => sum + r.zeroToleranceViolations.length, 0),
  };
}
