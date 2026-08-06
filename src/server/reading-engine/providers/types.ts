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
  /**
   * H4: is calling this provider free?
   *
   * The spend/concurrency gate applies to every provider EXCEPT those that
   * declare themselves free. MockProvider must stay ungated — gating it would
   * make the deterministic fallback unavailable at exactly the moment the gate
   * is what triggered the fallback, turning a cost control into an outage.
   *
   * Phrased as `isFree` rather than `isPaid` so the DEFAULT IS FAIL-SAFE: a
   * provider that declares nothing is gated. The opposite spelling would mean
   * a new paid provider that forgot the flag silently bypassed the spend
   * ceiling, which is precisely the failure this gate exists to prevent.
   * Declaring a provider free is a deliberate, visible act.
   */
  readonly isFree?: boolean;
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
