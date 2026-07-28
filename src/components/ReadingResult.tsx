'use client';

import { useId } from 'react';
import { DrawnCard } from '../types/reading';
import { InterpretationOutput } from '../types/interpretation';
import { KnowledgeResolutionMeta } from '../types/knowledge';
import { IntakeContext } from '../types/intake';
import { CardNarrationItem } from './CardNarrationItem';
import { DiagnosticBadge } from './DiagnosticBadge';
import { DisclaimerFooter } from './DisclaimerFooter';
import { resolvePersonaProfile } from '../lib/persona-mapping';
import { useFocusOnMount } from '../lib/use-focus-on-mount';

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
 * The long-form editorial reading (docs/UI_PREMIUM_V1.md FAZ 6) - optional,
 * reached only via PatternArrival's secondary CTA. Renders `cards` in the
 * exact order the array arrives in - no client-side sort/reorder/join logic
 * exists anywhere here; the array index IS the display order AND the
 * `interpretation.cards[i]` pairing (Sprint 4 UI Design Contract §5,
 * extending ADR-002/ADR-012's ground-truth invariant to the UI layer).
 * `narration.symbolicMeaning` is never read - not hidden, not sr-only, not a
 * data attribute - it is simply outside this screen's visible-content
 * contract (FAZ 6 §4).
 */
export function ReadingResult({ cards, interpretation, knowledgeMeta, providerUsed, intakeContext, onComplete }: ReadingResultProps) {
  const profile = resolvePersonaProfile(intakeContext.persona, intakeContext.spiritualPreference);
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const headingId = useId();
  const hasPatterns = interpretation.patterns.length > 0;
  const hasDiagnostics = knowledgeMeta.status === 'partial' || knowledgeMeta.status === 'fallback' || providerUsed === 'mock';

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      data-testid="reading-result"
      className="mt-4 rounded-[28px] border border-border-subtle bg-surface-raised/60 p-6 sm:p-8"
    >
      {/* Non-interactive: only receives programmatic focus-on-mount, so it
          must never show the interactive focus-visible ring. */}
      <h2
        ref={headingRef}
        id={headingId}
        tabIndex={-1}
        className="font-heading text-2xl text-foreground focus-visible:outline-none sm:text-3xl"
      >
        Kartların ayrıntılı okuması
      </h2>

      <p data-testid="persona-framing" className="mt-3 text-xs uppercase tracking-[0.2em] text-foreground-muted">
        {profile.framingLabel}
      </p>
      <p className="mt-2 whitespace-pre-line break-words text-base leading-relaxed text-foreground-secondary sm:text-lg">
        {interpretation.opening}
      </p>

      <div className="mt-8">
        <h3 className="font-heading text-lg text-foreground">Kartların anlattığı</h3>
        <ol data-testid="card-list" className="mt-3">
          {cards.map((card, i) => (
            <CardNarrationItem
              key={card.id}
              index={i}
              position={card.position}
              cardId={card.id}
              orientation={card.orientation}
              narration={interpretation.cards[i]}
            />
          ))}
        </ol>
      </div>

      <div data-testid="detailed-synthesis" className="mt-8">
        <h3 className="font-heading text-lg text-foreground">Bütünsel değerlendirme</h3>
        <p className="mt-3 whitespace-pre-line break-words text-base leading-[1.6] text-foreground sm:text-lg">
          {interpretation.practicalReflection}
        </p>

        {hasPatterns && (
          <div className="mt-4">
            <h4 className="font-heading text-sm text-foreground">Destekleyen ipuçları</h4>
            <ul data-testid="patterns" className="mt-2 space-y-1.5">
              {interpretation.patterns.map((pattern) => (
                <li
                  key={pattern}
                  className="relative break-words pl-4 text-sm text-foreground-secondary before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-gold/70"
                >
                  {pattern}
                </li>
              ))}
            </ul>
          </div>
        )}

        <aside className="mt-4 rounded-xl border border-border-subtle bg-surface p-3 text-[13px] text-foreground-secondary">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">Sınır notu</p>
          <p className="mt-1 whitespace-pre-line break-words">{interpretation.uncertaintyNotice}</p>
        </aside>
      </div>

      {hasDiagnostics && (
        <aside className="mt-6 rounded-xl border border-border-subtle bg-surface-interactive/60 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">Okuma durumu</p>
          <div className="mt-1 space-y-1">
            {knowledgeMeta.status === 'partial' && <DiagnosticBadge kind="knowledge-partial" />}
            {knowledgeMeta.status === 'fallback' && <DiagnosticBadge kind="knowledge-fallback" />}
            {providerUsed === 'mock' && <DiagnosticBadge kind="narration-fallback" />}
          </div>
        </aside>
      )}

      <DisclaimerFooter />

      {onComplete && (
        <button
          type="button"
          onClick={onComplete}
          className="mt-6 min-h-[52px] w-full min-w-[44px] rounded-2xl bg-accent px-4 text-base font-medium text-background sm:w-auto"
        >
          Okumayı bir soruyla tamamla
        </button>
      )}
    </section>
  );
}
