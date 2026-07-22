import { describe, expect, test } from 'vitest';
import { generateDeterministicReading, getAllCards } from '../../server/reading-engine';
import { DeterministicReadingSchema } from '../../types/reading';

describe('Card data integrity', () => {
  test('exactly 22 Major Arcana cards load', () => {
    expect(getAllCards()).toHaveLength(22);
  });

  test('no duplicate or missing numbers (0-21)', () => {
    const numbers = getAllCards()
      .map((c) => c.number)
      .sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 22 }, (_, i) => i));
  });

  test('no Strength/Justice or Tower/Star swaps', () => {
    const byNumber = new Map(getAllCards().map((c) => [c.number, c.cardId]));
    expect(byNumber.get(8)).toBe('08-strength');
    expect(byNumber.get(11)).toBe('11-justice');
    expect(byNumber.get(16)).toBe('16-tower');
    expect(byNumber.get(17)).toBe('17-star');
  });
});

describe('Deterministic Reading Engine', () => {
  test('same seed produces byte-identical output', () => {
    const a = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    const b = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test('different seeds produce different draws', () => {
    const a = generateDeterministicReading({ seed: 'seed-a', spread: 'three-card', topic: 'general' });
    const b = generateDeterministicReading({ seed: 'seed-b', spread: 'three-card', topic: 'general' });
    expect(JSON.stringify(a.cards)).not.toBe(JSON.stringify(b.cards));
  });

  test('draws exactly 3 distinct cards for three-card spread', () => {
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    expect(reading.cards).toHaveLength(3);
    expect(new Set(reading.cards.map((c) => c.id)).size).toBe(3);
  });

  test('positions are past/present/future in order, no duplicates', () => {
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    expect(reading.cards.map((c) => c.position)).toEqual(['past', 'present', 'future']);
  });

  test('ADR-002: every card is upright, never reversed', () => {
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    expect(reading.cards.every((c) => c.orientation === 'upright')).toBe(true);
  });

  test('output matches the Zod schema', () => {
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    expect(() => DeterministicReadingSchema.parse(reading)).not.toThrow();
  });

  test('interpretations are populated from real card data, not placeholders', () => {
    const reading = generateDeterministicReading({ seed: 'demo-001', spread: 'three-card', topic: 'general' });
    for (const interp of reading.interpretations) {
      expect(interp.symbolicMeaning.length).toBeGreaterThan(0);
      expect(interp.positionMeaning.length).toBeGreaterThan(0);
      expect(interp.contextMeaning.length).toBeGreaterThan(0);
    }
  });
});
