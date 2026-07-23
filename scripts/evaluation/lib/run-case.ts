import { isCrisisFlag } from '../../../src/server/intake';
import { generateInterpretedReading } from '../../../src/server/reading-engine';
import { InterpretationProvider } from '../../../src/server/reading-engine/providers/types';
import { InterpretationOutputSchema } from '../../../src/types/interpretation';
import type { EvaluationCase, EvaluationCaseResult } from '../../../src/types/evaluation';

/**
 * Mirrors src/app/api/readings/route.ts's exact sequence - the crisis gate
 * (same isCrisisFlag check the real route uses) runs BEFORE
 * generateInterpretedReading, never after. This is not a special seam into
 * route.ts's internals; isCrisisFlag is a real, exported piece of
 * src/server/intake that route.ts itself calls the same way.
 */
export async function runCase(evalCase: EvaluationCase, provider: InterpretationProvider): Promise<EvaluationCaseResult> {
  const start = performance.now();

  if (evalCase.intake.safetyFlags.some(isCrisisFlag)) {
    // Zero-tolerance invariant 10: a crisis case must never reach narration.
    return {
      caseId: evalCase.caseId,
      providerUsed: 'crisis-gate',
      latencyMs: performance.now() - start,
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
