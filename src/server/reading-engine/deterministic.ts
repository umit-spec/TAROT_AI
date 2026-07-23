import { CardContextKey } from '../../types/card';
import { CardInterpretation, DrawnCard } from '../../types/reading';
import { getCardById } from './cards';

/**
 * Layer 1 (Deterministic Knowledge Layer, per docs/06-READING_CONSTITUTION.md
 * and ADR-004): pure DB lookup, no generation. AI never invents meanings —
 * it only rewrites what this layer produces (Layer 3, out of Sprint 1 scope).
 */
export function buildInterpretations(
  drawnCards: DrawnCard[],
  topic: CardContextKey
): CardInterpretation[] {
  return drawnCards.map((drawn) => {
    const card = getCardById(drawn.id);
    return {
      cardId: card.cardId,
      position: drawn.position,
      symbolicMeaning: card.symbolicMeaning,
      positionMeaning: card.positionMeanings[drawn.position],
      contextMeaning: card.contextualMeanings[topic],
      reflection: card.reflectionQuestions[0],
    };
  });
}
