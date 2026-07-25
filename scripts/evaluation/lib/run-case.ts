import { isCrisisFlag } from '../../../src/server/intake';
import { generateInterpretedReading } from '../../../src/server/reading-engine';
import { InterpretationProvider } from '../../../src/server/reading-engine/providers/types';
import { InterpretationOutputSchema } from '../../../src/types/interpretation';
import { validateReflectionPrompt } from '../../../src/server/reading-engine/validate';
import type { EvaluationCase, EvaluationCaseResult } from '../../../src/types/evaluation';
import type { RawCaseArtifact } from './raw';

/**
 * Optional raw-capture sink (Sprint S2). When provided, runCase hands it a
 * per-case artifact including the narration output. Off by default - only the
 * live-anthropic harness in --retain-raw mode passes one, so mock/live runs
 * with the flag off capture nothing.
 */
export interface RunCaseOptions {
  captureRaw?: (artifact: RawCaseArtifact) => void;
  providerLabel?: string;
  model?: string;
}

/**
 * Mirrors src/app/api/readings/route.ts's exact sequence - the crisis gate
 * (same isCrisisFlag check the real route uses) runs BEFORE
 * generateInterpretedReading, never after. This is not a special seam into
 * route.ts's internals; isCrisisFlag is a real, exported piece of
 * src/server/intake that route.ts itself calls the same way.
 */
export async function runCase(
  evalCase: EvaluationCase,
  provider: InterpretationProvider,
  options: RunCaseOptions = {},
): Promise<EvaluationCaseResult> {
  const start = performance.now();
  const label = options.providerLabel ?? 'unknown';

  if (evalCase.intake.safetyFlags.some(isCrisisFlag)) {
    // Zero-tolerance invariant 10: a crisis case must never reach narration.
    const latencyMs = performance.now() - start;
    options.captureRaw?.({
      caseId: evalCase.caseId,
      provider: 'crisis-gate',
      model: options.model,
      request: { seed: evalCase.seed, spread: evalCase.spread, intake: evalCase.intake, questionText: evalCase.questionText },
      response: { providerUsed: 'crisis-gate' },
      latencyMs,
    });
    return {
      caseId: evalCase.caseId,
      providerUsed: 'crisis-gate',
      latencyMs,
      zeroToleranceViolations: [],
    };
  }

  const violations: string[] = [];
  const { output, providerUsed, promptVersionUsed, fallbackReason, usage } = await generateInterpretedReading({
    seed: evalCase.seed,
    spread: evalCase.spread,
    intake: evalCase.intake,
    questionText: evalCase.questionText,
    provider,
  });
  const latencyMs = performance.now() - start;

  // Zero-tolerance invariants 9/13: the resolved output must always be
  // schema-valid - a violation here means the pipeline's own guarantee
  // (validateInterpretation always runs before returning) broke.
  if (!InterpretationOutputSchema.safeParse(output).success) {
    violations.push('invariant-9-13-schema-invalid-or-unvalidated-output-returned');
  }

  // ADR-UX-REFLECTION-PROMPT §7: whatever the model produced, the resolved
  // reflectionPrompt must always be exactly one safe reflective question
  // (the provider's if it passed validation, else the governed fallback).
  if (validateReflectionPrompt(output.reflectionPrompt) === null) {
    violations.push('reflection-prompt-invalid-or-not-a-single-question');
  }

  options.captureRaw?.({
    caseId: evalCase.caseId,
    provider: label,
    model: options.model,
    promptVersionUsed,
    request: { seed: evalCase.seed, spread: evalCase.spread, intake: evalCase.intake, questionText: evalCase.questionText },
    response: { providerUsed, fallbackReason, output, usage },
    latencyMs,
  });

  return {
    caseId: evalCase.caseId,
    providerUsed,
    promptVersionUsed,
    fallbackReason,
    usage,
    latencyMs,
    zeroToleranceViolations: violations,
  };
}
