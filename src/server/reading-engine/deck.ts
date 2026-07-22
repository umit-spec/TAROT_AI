import { DrawnCard, SpreadType } from '../../types/reading';
import { CardPositionKey } from '../../types/card';
import { getAllCards } from './cards';

const THREE_CARD_POSITIONS: CardPositionKey[] = ['past', 'present', 'future'];

/**
 * xmur3 string hash -> 32-bit seed for mulberry32.
 * Deterministic: same seed string always yields the same numeric seed.
 */
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seedString: string): T[] {
  const hashGen = xmur3(seedString);
  const rng = mulberry32(hashGen());
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Deterministically draws cards for a spread from a seed string.
 * Same seed + same spread => byte-identical draw, every time (no Date.now,
 * no Math.random). ADR-002: orientation is always "upright" in MVP.
 */
export function drawCards(seed: string, spread: SpreadType): DrawnCard[] {
  const allIds = getAllCards().map((c) => c.cardId);
  const shuffled = seededShuffle(allIds, seed);

  if (spread === 'three-card') {
    const drawn = shuffled.slice(0, 3);
    return drawn.map((id, i) => ({
      id,
      position: THREE_CARD_POSITIONS[i],
      orientation: 'upright' as const,
    }));
  }

  throw new Error(`Unsupported spread type: ${spread}`);
}
