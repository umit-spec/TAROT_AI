import { CardContextKey } from '../../types/card';
import { InterpretationOutput, Persona } from '../../types/interpretation';
import { DeterministicReading, SpreadType } from '../../types/reading';
import { drawCards } from './deck';
import { buildInterpretations } from './deterministic';
import { InterpretationProvider } from './providers/types';
import { MockProvider } from './providers/mock';
import { findPatterns } from './synthesis';
import { validateInterpretation, validateReading } from './validate';

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

export interface GenerateInterpretedReadingInput extends GenerateReadingInput {
  persona: Persona;
  provider: InterpretationProvider;
}

const fallbackProvider = new MockProvider();

/**
 * Layer 1+2 (always) + Layer 3 (via the given provider). If the provider
 * throws (Claude down, rate-limited, invalid output) this falls back to
 * MockProvider rather than failing the request - docs/06-READING_CONSTITUTION.md
 * fallback mode: deterministic-only reading delivered, "AI-enhanced
 * insights" quietly not shown, safety maintained over polish.
 */
export async function generateInterpretedReading(
  input: GenerateInterpretedReadingInput
): Promise<{ output: InterpretationOutput; providerUsed: string }> {
  const reading = generateDeterministicReading(input);

  try {
    const output = validateInterpretation(
      await input.provider.generate({ reading, persona: input.persona })
    );
    return { output, providerUsed: input.provider.name };
  } catch {
    const output = validateInterpretation(
      await fallbackProvider.generate({ reading, persona: input.persona })
    );
    return { output, providerUsed: fallbackProvider.name };
  }
}

export { drawCards } from './deck';
export { getAllCards, getCardById } from './cards';
export { MockProvider } from './providers/mock';
export type { InterpretationProvider } from './providers/types';
