import { CardPositionKey } from '../types/card';
import { CardNarration } from '../types/interpretation';
import { cardDisplayName } from '../lib/card-display';

export interface CardNarrationItemProps {
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

/** Receives only what it needs to render - no access to the full response, no access to raw safetyFlags. */
export function CardNarrationItem({ position, cardId, narration }: CardNarrationItemProps) {
  return (
    <li aria-label={`card-${cardId}`} className="border-b border-diagnostic-subtle py-3 last:border-0">
      <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">{POSITION_LABEL[position]}</p>
      <p className="font-heading text-lg">{cardDisplayName(cardId)}</p>
      <p className="mt-1">{narration.relevanceToQuestion}</p>
      <p className="mt-1 text-sm italic text-ink-muted">{narration.reflection}</p>
    </li>
  );
}
