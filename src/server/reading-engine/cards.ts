import fs from 'fs';
import path from 'path';
import { CardData, CardDataSchema } from '../../types/card';

const CARDS_DIR = path.join(process.cwd(), 'data', 'cards');

/** Bump by hand when data/cards/*.json content changes meaningfully. Surfaced in API responses (versions.deck). */
export const DECK_DATA_VERSION = '1.0.0';

let cache: CardData[] | null = null;

function loadAll(): CardData[] {
  const files = fs
    .readdirSync(CARDS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const cards = files.map((file) => {
    const raw = JSON.parse(fs.readFileSync(path.join(CARDS_DIR, file), 'utf-8'));
    return CardDataSchema.parse(raw);
  });

  if (cards.length !== 22) {
    throw new Error(`Expected 22 Major Arcana cards, found ${cards.length}`);
  }
  const ids = new Set(cards.map((c) => c.cardId));
  if (ids.size !== 22) {
    throw new Error('Duplicate card IDs detected in data/cards');
  }
  const numbers = cards.map((c) => c.number).sort((a, b) => a - b);
  for (let i = 0; i < 22; i++) {
    if (numbers[i] !== i) {
      throw new Error(`Card numbering gap or duplicate at position ${i}`);
    }
  }

  return cards.sort((a, b) => a.number - b.number);
}

export function getAllCards(): CardData[] {
  if (!cache) {
    cache = loadAll();
  }
  return cache;
}

export function getCardById(cardId: string): CardData {
  const card = getAllCards().find((c) => c.cardId === cardId);
  if (!card) {
    throw new Error(`Unknown card id: ${cardId}`);
  }
  return card;
}
