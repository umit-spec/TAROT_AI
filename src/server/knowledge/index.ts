import { IntakeContext } from '../../types/intake';
import { EMPTY_KNOWLEDGE_CONTEXT, KnowledgeResolutionResult } from '../../types/knowledge';
import { DeterministicReading } from '../../types/reading';
import { classifyKnowledgeError } from './errors';
import { KnowledgeProvider } from './types';

/**
 * Centralized catch, mirroring generateInterpretedReading's provider
 * fallback (Sprint 2 precedent) - but observable, not silent. If
 * `provider.resolveContext()` throws, this substitutes
 * EMPTY_KNOWLEDGE_CONTEXT and reports status: 'fallback' with an
 * errorCode, rather than swallowing the failure. A 'resolved'/'partial'
 * outcome from the provider itself passes through untouched - those are
 * legitimate resolution outcomes, not failures.
 */
export async function resolveKnowledge(
  provider: KnowledgeProvider,
  reading: DeterministicReading,
  intake: IntakeContext
): Promise<KnowledgeResolutionResult> {
  try {
    return await provider.resolveContext(reading, intake);
  } catch (err) {
    return {
      meta: {
        status: 'fallback',
        provider: provider.name,
        version: 'unknown',
        errorCode: classifyKnowledgeError(err),
      },
      context: EMPTY_KNOWLEDGE_CONTEXT,
    };
  }
}

export { LocalJsonKnowledgeProvider } from './local-json-provider';
export type { KnowledgeProvider } from './types';
export { loadKnowledgeBundle } from './bundle';
