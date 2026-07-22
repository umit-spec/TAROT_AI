import { InterpretationInput, InterpretationOutput } from '../../../types/interpretation';

/**
 * ADR-011: the LLM (or anything else) is a narration-only layer. Every
 * provider receives the same structured InterpretationInput and must return
 * the same InterpretationOutput shape - it may rephrase, it may not
 * originate a card meaning, a pairing, or a safety judgment. The Reading
 * Engine (deck.ts, deterministic.ts, synthesis.ts) never imports a specific
 * provider; callers depend only on this interface.
 */
export interface InterpretationProvider {
  readonly name: string;
  // Undefined for providers with no prompt concept (MockProvider - no LLM
  // call at all). Reported as "n/a" in the API's versions.prompt field.
  readonly promptVersion?: string;
  generate(input: InterpretationInput): Promise<InterpretationOutput>;
}
