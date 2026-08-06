import { ZodError } from 'zod';
import { CardContextKey } from '../../types/card';
import { InterpretationOutput } from '../../types/interpretation';
import { IntakeContext } from '../../types/intake';
import { KnowledgeContext, KnowledgeResolutionResult } from '../../types/knowledge';
import { DeterministicReading, SpreadType } from '../../types/reading';
import type { FallbackReason, TokenUsage } from '../../types/evaluation';
import { toCardContext } from '../intake';
import { LocalJsonKnowledgeProvider, resolveKnowledge } from '../knowledge';
import { KnowledgeProvider } from '../knowledge/types';
import { drawCards } from './deck';
import { buildInterpretations } from './deterministic';
import { InterpretationProvider } from './providers/types';
import { MockProvider } from './providers/mock';
import { ProviderGateError, runGuardedProviderCall } from '../observability/provider-gate';
import { findPatterns } from './synthesis';
import {
  ReadingValidationError,
  governInterpretation,
  resolveReflectionPrompt,
  validateInterpretation,
  validateReading,
} from './validate';

/**
 * Sprint 6: separates what generateInterpretedReading's single fallback
 * catch block used to collapse into one signal (providerUsed: 'mock') into
 * the three actually-distinct causes an evaluation harness needs to count
 * separately - a red-line phrase rejection, a schema-shape failure, or a
 * real provider/network error are different problems with different fixes.
 */
function classifyFallbackReason(err: unknown): FallbackReason {
  // H4: a gate block is NOT a provider failure - the provider was never
  // called. Keeping these distinct lets an operator tell "the model broke"
  // apart from "we hit our own ceiling" and "we are shedding load".
  if (err instanceof ProviderGateError) return err.reason;
  if (err instanceof ReadingValidationError) return 'red-line-rejected';
  if (err instanceof ZodError) return 'schema-invalid';
  return 'provider-error';
}

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
  // Raw user question text, if collected - forwarded untouched to whatever
  // provider needs it (Claude does; Mock ignores it). Never used here for
  // classification - that already happened in the Intake Engine.
  questionText?: string;
  provider: InterpretationProvider;
  // ADR-012: optional so existing callers don't have to change; defaults to
  // the bundled proof-of-concept LocalJsonKnowledgeProvider.
  knowledgeProvider?: KnowledgeProvider;
}

const fallbackProvider = new MockProvider();
const defaultKnowledgeProvider = new LocalJsonKnowledgeProvider();

async function runProvider(
  provider: InterpretationProvider,
  reading: DeterministicReading,
  intake: IntakeContext,
  knowledge: KnowledgeContext,
  questionText: string
): Promise<{ output: InterpretationOutput; reflectionPromptSource: 'provider' | 'fallback' }> {
  // H4: every provider call passes the gate (kill switch, daily spend
  // ceiling, concurrency bound) UNLESS the provider declares itself free.
  // Default-gated is the fail-safe direction - see providers/types.ts.
  const raw = provider.isFree
    ? await provider.generate({ reading, intake, knowledge, questionText })
    : await runGuardedProviderCall(
        () => provider.generate({ reading, intake, knowledge, questionText }),
        () => provider.getLastUsage?.()
      );
  // Union, not overwrite: a provider could someday add its own flags
  // (e.g. detecting tone issues) on top of what Intake already found.
  const safetyFlags = Array.from(new Set([...raw.safetyFlags, ...intake.safetyFlags]));
  // Field-level governed reflection prompt (ADR-UX-REFLECTION-PROMPT A1/A2)
  // before the final red-line/schema gate.
  const withFlags = { ...raw, safetyFlags };
  const { source } = resolveReflectionPrompt(withFlags);

  // H3 applies TWO layers, deliberately not one instead of the other.
  //
  // Layer A — whole-output rejection on a real safety violation. If a
  // provider produced a prophecy, a command, or a diagnosis, the rest of its
  // output is not trustworthy either: the policy is a denylist, so a model
  // that tripped it once may carry subtler violations it did not catch.
  // Throwing here preserves the pre-existing, more conservative behaviour —
  // the whole narration is regenerated by MockProvider and the cause is
  // reported as 'red-line-rejected' to the evaluation harness.
  //
  // Layer B — field-level governance for STRUCTURAL problems (missing,
  // too short, too long) and as defense in depth on whichever output is
  // finally used, including the fallback provider's.
  const { output: governed, fieldFallbacks } = governInterpretation(withFlags);

  const safetyViolations = fieldFallbacks.filter((f) => f.categories.length > 0);
  if (safetyViolations.length > 0) {
    // Categorical only — the offending text is never put in the message.
    const categories = Array.from(new Set(safetyViolations.flatMap((f) => f.categories))).sort();
    throw new ReadingValidationError(
      `Output safety policy violated in ${safetyViolations.length} field(s): ${categories.join(', ')}`
    );
  }

  const output = validateInterpretation(governed);
  return { output, reflectionPromptSource: source };
}

/**
 * Layer 1+2 (always) + Knowledge resolution (ADR-012) + Layer 3 (via the
 * given provider), fed by the Intake Engine's classification (persona,
 * questionDomain -> topic, safetyFlags). If the InterpretationProvider
 * throws or its output fails the red-line scan, this falls back to
 * MockProvider - docs/06-READING_CONSTITUTION.md fallback mode. If the
 * KnowledgeProvider throws, resolveKnowledge() (src/server/knowledge)
 * already turns that into an observable 'fallback'-status empty context,
 * not a silent one - see docs/SPRINT_3_KNOWLEDGE_CONTRACT_API_PLAN.md.
 * Knowledge is resolved once and reused for both the primary and fallback
 * narration attempt - narration-provider failure and knowledge-provider
 * failure are independent risks, not one general "something broke" bucket.
 * Note: this does NOT check intake.safetyFlags for crisis_* and refuse to
 * generate - that gate belongs to the caller (the API route), per "Intake
 * Engine kart seçimine müdahale etmesin."
 */
export async function generateInterpretedReading(input: GenerateInterpretedReadingInput): Promise<{
  reading: DeterministicReading;
  output: InterpretationOutput;
  providerUsed: string;
  // Undefined whenever MockProvider actually produced the output (either
  // because it was passed in directly, or because of a fallback) - reports
  // whichever provider *actually* ran, never the one that was merely
  // attempted. Getting this wrong would make the API report a Claude
  // prompt version for output MockProvider actually generated.
  promptVersionUsed?: string;
  knowledge: KnowledgeResolutionResult;
  // Sprint 6, additive: which of the 3 distinct causes triggered a
  // fallback - undefined when the primary provider succeeded outright.
  fallbackReason?: FallbackReason;
  // Sprint 6, additive: token usage from whichever provider actually ran,
  // when that provider exposes it (see providers/types.ts's optional
  // getLastUsage()) - undefined for MockProvider, which has none to report.
  usage?: TokenUsage;
  // ADR-UX-REFLECTION-PROMPT A4: categorical only - whether the reflection
  // prompt came from the provider or the central governed fallback. No prompt
  // text; safe for metadata-only telemetry.
  reflectionPromptSource: 'provider' | 'fallback';
}> {
  const reading = generateDeterministicReading({
    seed: input.seed,
    spread: input.spread,
    topic: toCardContext(input.intake.questionDomain),
  });

  const questionText = input.questionText ?? '';
  const knowledgeResult = await resolveKnowledge(
    input.knowledgeProvider ?? defaultKnowledgeProvider,
    reading,
    input.intake
  );

  try {
    const { output, reflectionPromptSource } = await runProvider(
      input.provider,
      reading,
      input.intake,
      knowledgeResult.context,
      questionText
    );
    return {
      reading,
      output,
      providerUsed: input.provider.name,
      promptVersionUsed: input.provider.promptVersion,
      knowledge: knowledgeResult,
      usage: input.provider.getLastUsage?.(),
      reflectionPromptSource,
    };
  } catch (err) {
    const fallbackReason = classifyFallbackReason(err);
    const { output, reflectionPromptSource } = await runProvider(
      fallbackProvider,
      reading,
      input.intake,
      knowledgeResult.context,
      questionText
    );
    return {
      reading,
      output,
      providerUsed: fallbackProvider.name,
      promptVersionUsed: fallbackProvider.promptVersion,
      knowledge: knowledgeResult,
      fallbackReason,
      reflectionPromptSource,
    };
  }
}

export { drawCards, DECK_ALGORITHM_VERSION } from './deck';
export { getAllCards, getCardById, DECK_DATA_VERSION } from './cards';
export { MockProvider } from './providers/mock';
export { ClaudeProvider } from './providers/claude';
export type { InterpretationProvider } from './providers/types';
