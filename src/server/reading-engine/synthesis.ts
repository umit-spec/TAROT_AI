import { DrawnCard } from '../../types/reading';
import { getCardById } from './cards';

/**
 * Layer 2 (Synthesis, per ADR-004): pattern detection across drawn cards,
 * still no AI. Currently: keyword repetition across 2+ cards. Deliberately
 * conservative — under-detecting a theme is safer than inventing one.
 */
export function findPatterns(drawnCards: DrawnCard[]): string[] {
  const keywordCounts = new Map<string, number>();

  for (const drawn of drawnCards) {
    const card = getCardById(drawn.id);
    for (const keyword of card.keywords) {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) + 1);
    }
  }

  const repeated = [...keywordCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([keyword]) => keyword);

  return repeated.map((keyword) => `Tekrarlayan tema: ${keyword}`);
}
