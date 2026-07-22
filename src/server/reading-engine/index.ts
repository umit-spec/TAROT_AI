import { CardContextKey } from '../../types/card';
import { InterpretationOutput } from '../../types/interpretation';
import { IntakeContext } from '../../types/intake';
import { DeterministicReading, SpreadType } from '../../types/reading';
import { toCardContext } from '../intake';
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

export interface GenerateInterpretedReadingInput {
  seed: string;
  spread: SpreadType;
  intake: IntakeContext;
  provider: InterpretationProvider;
}

const fallbackProvider = new MockProvider();

async function runProvider(
  provider: InterpretationProvider,
  reading: DeterministicReading,
  intake: IntakeContext
): Promise<InterpretationOutput> {
  const raw = await provider.generate({ reading, persona: intake.persona });
  // Union, not overwrite: a provider could someday add its own flags
  // (e.g. detecting tone issues) on top of what Intake already found.
  const safetyFlags = Array.from(new Set([...raw.safetyFlags, ...intake.safetyFlags]));
  return validateInterpretation({ ...raw, safetyFlags });
}

/**
 * Layer 1+2 (always) + Layer 3 (via the given provider), fed by the Intake
 * Engine's classification (persona, questionDomain -> topic, safetyFlags).
 * If the provider throws (Claude down, rate-limited) or its output fails
 * the red-line scan, this falls back to MockProvider rather than failing
 * the request - docs/06-READING_CONSTITUTION.md fallback mode: deterministic-
 * only reading delivered, safety maintained over polish. Note: this does
 * NOT check intake.safetyFlags for crisis_* and refuse to generate - that
 * gate belongs to the caller (e.g. the future API route), per "Intake
 * Engine kart seçimine müdahale etmesin."
 */
export async function generateInterpretedReading(
  input: GenerateInterpretedReadingInput
): Promise<{ output: InterpretationOutput; providerUsed: string }> {
  const reading = generateDeterministicReading({
    seed: input.seed,
    spread: input.spread,
    topic: toCardContext(input.intake.questionDomain),
  });

  try {
    const output = await runProvider(input.provider, reading, input.intake);
    return { output, providerUsed: input.provider.name };
  } catch {
    const output = await runProvider(fallbackProvider, reading, input.intake);
    return { output, providerUsed: fallbackProvider.name };
  }
}

export { drawCards } from './deck';
export { getAllCards, getCardById } from './cards';
export { MockProvider } from './providers/mock';
export type { InterpretationProvider } from './providers/types';
