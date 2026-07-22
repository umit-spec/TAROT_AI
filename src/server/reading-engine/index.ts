import { CardContextKey } from '../../types/card';
import { DeterministicReading, SpreadType } from '../../types/reading';
import { drawCards } from './deck';
import { buildInterpretations } from './deterministic';
import { findPatterns } from './synthesis';
import { validateReading } from './validate';

export interface GenerateReadingInput {
  seed: string;
  spread: SpreadType;
  topic: CardContextKey;
}

/**
 * Orchestrates Layer 1 (deterministic) + Layer 2 (synthesis) per ADR-004.
 * No AI call here — Layer 3 (Claude language rewrite) wraps this output in
 * Sprint 2. Deterministic-only is also the fallback path when Claude is
 * unavailable (docs/06-READING_CONSTITUTION.md fallback mode).
 */
export function generateDeterministicReading(input: GenerateReadingInput): DeterministicReading {
  const cards = drawCards(input.seed, input.spread);
  const interpretations = buildInterpretations(cards, input.topic);
  const patterns = findPatterns(cards);

  return validateReading({
    seed: input.seed,
    spread: input.spread,
    topic: input.topic,
    cards,
    interpretations,
    patterns,
  });
}

export { drawCards } from './deck';
export { getAllCards, getCardById } from './cards';
