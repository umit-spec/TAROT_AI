import { describe, expect, test } from 'vitest';
import { getAllCards } from '../../server/reading-engine';
import {
  CARD_DISPLAY_FALLBACK,
  CARD_DISPLAY_REGISTRY,
  cardDisplayName,
} from '../../lib/card-display';

const cards = getAllCards();

describe('card-display registry — locked to the governed card data', () => {
  test('every governed card has a registry entry whose displayName === name_tr', () => {
    for (const c of cards) {
      const meta = CARD_DISPLAY_REGISTRY[c.cardId];
      expect(meta, `missing registry entry for ${c.cardId}`).toBeDefined();
      // Sourced verbatim from the governed data - no free re-translation.
      expect(meta.displayName).toBe(c.name_tr);
      expect(meta.arcana).toBe(c.arcana);
      expect(meta.displayName.length).toBeGreaterThan(0);
      expect(meta.cardId).toBe(c.cardId);
    }
  });

  test('the registry has exactly the deck ids — no extras, no duplicates', () => {
    const deckIds = cards.map((c) => c.cardId).sort();
    const registryIds = Object.keys(CARD_DISPLAY_REGISTRY).sort();
    expect(registryIds).toEqual(deckIds);
    // Keyed by id, so uniqueness is structural, but assert count matches too.
    expect(registryIds.length).toBe(deckIds.length);
  });

  test('an unknown id resolves to the safe fallback, never the raw id', () => {
    expect(cardDisplayName('99-not-a-card')).toBe(CARD_DISPLAY_FALLBACK);
    expect(cardDisplayName('99-not-a-card')).not.toBe('99-not-a-card');
    expect(cardDisplayName('')).toBe(CARD_DISPLAY_FALLBACK);
  });

  test('cardDisplayName is a pure lookup that preserves input order', () => {
    const ordered = ['00-fool', '01-magician', '02-high-priestess'];
    const names = ordered.map(cardDisplayName);
    expect(names).toEqual(['Deli', 'Büyücü', 'Yüksek Rahibe']);
    // The lookup does not reorder or mutate its input.
    expect(ordered).toEqual(['00-fool', '01-magician', '02-high-priestess']);
  });
});
