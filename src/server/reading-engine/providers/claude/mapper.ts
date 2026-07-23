import { z } from 'zod';
import { CardNarration, InterpretationOutput } from '../../../../types/interpretation';
import { DeterministicReading } from '../../../../types/reading';
import { UNCERTAINTY_NOTICE } from '../shared';
import { ClaudeOutputValidationError } from './errors';

export const ClaudeInterpretationOutputSchema = z.object({
  summary: z.string().min(1),
  cardInsights: z.array(
    z.object({
      cardId: z.string(),
      role: z.string(),
      insight: z.string().min(1),
    })
  ),
  synthesis: z.string().min(1),
  reflectionPrompt: z.string().min(1),
  safetyAcknowledgement: z.string().optional(),
});
export type ClaudeInterpretationOutput = z.infer<typeof ClaudeInterpretationOutputSchema>;

/** Never retried (see errors.ts) - a malformed response fails fast so the caller can fall back. */
export function parseClaudeResponseText(text: string): ClaudeInterpretationOutput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ClaudeOutputValidationError('Claude response was not valid JSON');
  }

  const result = ClaudeInterpretationOutputSchema.safeParse(parsed);
  if (!result.success) {
    throw new ClaudeOutputValidationError(`Claude response failed schema validation: ${result.error.message}`);
  }
  return result.data;
}

/**
 * symbolicMeaning, position, reflection, and patterns all come from the
 * DeterministicReading (Layer 1+2 ground truth) - never from Claude. Only
 * `insight` (the narrated text) and the top-level summary/synthesis/
 * reflectionPrompt come from the model. uncertaintyNotice is the fixed
 * constant, not model output. safetyFlags is always [] here - never
 * provider-controlled, merged centrally by generateInterpretedReading.
 */
export function mapToInterpretationOutput(
  claudeOutput: ClaudeInterpretationOutput,
  reading: DeterministicReading
): InterpretationOutput {
  if (claudeOutput.cardInsights.length !== reading.interpretations.length) {
    throw new ClaudeOutputValidationError(
      `Expected ${reading.interpretations.length} cardInsights, got ${claudeOutput.cardInsights.length}`
    );
  }

  const cards: CardNarration[] = reading.interpretations.map((interp, i) => {
    const insight = claudeOutput.cardInsights[i];
    if (insight.cardId !== interp.cardId) {
      throw new ClaudeOutputValidationError(
        `Card order/id mismatch at position ${i}: expected "${interp.cardId}", got "${insight.cardId}"`
      );
    }
    return {
      cardId: interp.cardId,
      position: interp.position,
      symbolicMeaning: interp.symbolicMeaning,
      relevanceToQuestion: insight.insight,
      reflection: interp.reflection,
    };
  });

  return {
    opening: claudeOutput.summary,
    cards,
    patterns: reading.patterns,
    practicalReflection: `${claudeOutput.synthesis} ${claudeOutput.reflectionPrompt}`.trim(),
    uncertaintyNotice: UNCERTAINTY_NOTICE,
    safetyFlags: [],
  };
}
