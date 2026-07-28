import { DrawnCard } from '../types/reading';
import { InterpretationOutput } from '../types/interpretation';
import { KnowledgeResolutionMeta } from '../types/knowledge';
import { IntakeContext } from '../types/intake';
import { CardNarrationItem } from './CardNarrationItem';
import { DiagnosticBadge } from './DiagnosticBadge';
import { DisclaimerFooter } from './DisclaimerFooter';
import { resolvePersonaProfile } from '../lib/persona-mapping';

export interface ReadingResultProps {
  cards: DrawnCard[];
  interpretation: InterpretationOutput;
  knowledgeMeta: KnowledgeResolutionMeta;
  providerUsed: string;
  intakeContext: IntakeContext;
  /** Optional: close the session with the single reflection question after
   * the details. Same destination as the pattern screen's primary CTA. */
  onComplete?: () => void;
}

/**
 * Renders `cards` in the exact order the array arrives in - no client-side
 * sort/reorder logic exists anywhere here; the array index IS the display
 * order (Sprint 4 UI Design Contract §5, extending ADR-002/ADR-012's
 * ground-truth invariant to the UI layer).
 */
export function ReadingResult({ cards, interpretation, knowledgeMeta, providerUsed, intakeContext, onComplete }: ReadingResultProps) {
  const profile = resolvePersonaProfile(intakeContext.persona, intakeContext.spiritualPreference);

  return (
    <section aria-label="reading-result">
      <p aria-label="persona-framing" className="text-sm text-ink-muted">
        {profile.framingLabel}
      </p>
      <p className="mt-2 text-lg">{interpretation.opening}</p>

      <ol aria-label="card-list">
        {cards.map((card, i) => (
          <CardNarrationItem
            key={card.id}
            position={card.position}
            cardId={card.id}
            orientation={card.orientation}
            narration={interpretation.cards[i]}
          />
        ))}
      </ol>

      <div aria-label="detailed-synthesis" className="mt-4">
        <p>{interpretation.practicalReflection}</p>
        {interpretation.patterns.length > 0 && (
          <ul aria-label="patterns" className="mt-2 list-inside list-disc text-sm">
            {interpretation.patterns.map((pattern) => (
              <li key={pattern}>{pattern}</li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-sm italic">{interpretation.uncertaintyNotice}</p>
      </div>

      {knowledgeMeta.status === 'partial' && <DiagnosticBadge kind="knowledge-partial" />}
      {knowledgeMeta.status === 'fallback' && <DiagnosticBadge kind="knowledge-fallback" />}
      {providerUsed === 'mock' && <DiagnosticBadge kind="narration-fallback" />}

      <DisclaimerFooter />

      {onComplete && (
        <button
          type="button"
          onClick={onComplete}
          className="mt-4 min-h-[44px] min-w-[44px] rounded bg-accent px-4 text-background"
        >
          Okumayı bir soruyla tamamla
        </button>
      )}
    </section>
  );
}
