import { IntakeContext } from '../../types/intake';
import { KnowledgeResolutionResult } from '../../types/knowledge';
import { DeterministicReading } from '../../types/reading';

/**
 * Mirrors InterpretationProvider's shape exactly (Sprint 2 precedent).
 * ADR-012: a KnowledgeProvider resolves context ABOUT an already-drawn
 * reading - it receives `reading` as a read-only argument, it never draws,
 * reorders, or selects cards. `LocalJsonKnowledgeProvider` is the only
 * implementation this sprint; `FutureDatabaseKnowledgeProvider` does not
 * exist yet - this interface is what makes adding it later a new file, not
 * a change to every call site.
 */
export interface KnowledgeProvider {
  readonly name: string;
  resolveContext(reading: DeterministicReading, intake: IntakeContext): Promise<KnowledgeResolutionResult>;
}
