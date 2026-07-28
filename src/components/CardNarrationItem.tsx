import { CardPositionKey } from '../types/card';
import { CardNarration } from '../types/interpretation';
import { cardDisplayName } from '../lib/card-display';

export interface CardNarrationItemProps {
  /** Position within the reading (0/1/2) - used only for a stable,
   * identity-free test hook (docs/UI_PREMIUM_V1.md FAZ 6 §10); the raw
   * cardId never appears in an accessible name, visible text, or attribute. */
  index: number;
  position: CardPositionKey;
  cardId: string;
  orientation: 'upright'; // ADR-002 - no 'reversed' variant exists in the type
  narration: CardNarration;
}

// "Yön" (a direction to consider), not "Gelecek" (an event foretold) - the
// anti-prophecy copy contract. Internal position value stays 'future'.
const POSITION_LABEL: Record<CardPositionKey, string> = {
  past: 'Geçmiş',
  present: 'Şimdi',
  future: 'Yön',
};

/**
 * An editorial section, not a dashboard card (docs/UI_PREMIUM_V1.md FAZ 6).
 * Receives only what it needs to render - no access to the full response, no
 * access to raw safetyFlags, and deliberately no `narration.symbolicMeaning`
 * prop path: that field exists in the governed data but is not part of the
 * current visible-content contract, so it is never read here.
 */
export function CardNarrationItem({ index, position, narration, cardId }: CardNarrationItemProps) {
  return (
    <li data-testid={`card-narration-${index}`} className="border-b border-border-subtle py-6 first:pt-0 last:border-0 last:pb-0">
      <article className="sm:grid sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">{POSITION_LABEL[position]}</p>
          <p className="mt-1 break-words font-heading text-xl text-foreground">{cardDisplayName(cardId)}</p>
        </header>
        <div className="mt-3 sm:mt-0">
          <p className="whitespace-pre-line break-words text-base leading-relaxed text-foreground sm:text-lg">
            {narration.relevanceToQuestion}
          </p>
          <p className="mt-3 whitespace-pre-line break-words rounded-r-lg border-l-2 border-violet/50 bg-violet-deep/10 p-3 text-sm italic leading-relaxed text-foreground-secondary">
            {narration.reflection}
          </p>
        </div>
      </article>
    </li>
  );
}
