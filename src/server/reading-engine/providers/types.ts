import { InterpretationInput, RawInterpretationOutput } from '../../../types/interpretation';
import type { TokenUsage } from '../../../types/evaluation';

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
  // Returns RAW output (reflectionPrompt may be absent); the engine
  // normalizes it into the final governed output (ADR-UX-REFLECTION-PROMPT A1).
  generate(input: InterpretationInput): Promise<RawInterpretationOutput>;
  // Sprint 6, additive/optional: a provider MAY expose token usage from its
  // most recent call (ClaudeProvider does; MockProvider has no real usage
  // to report, so it simply doesn't implement this - no existing provider
  // or caller needs to change for this to be safe to add).
  getLastUsage?(): TokenUsage | undefined;
}
