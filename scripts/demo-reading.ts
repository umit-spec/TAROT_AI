#!/usr/bin/env tsx
/**
 * Sprint 1 exit proof: deterministic three-card draw.
 * Same seed -> byte-identical JSON, every run. Prints the locked minimal
 * shape by default; pass --full to also see Layer 1+2 interpretations.
 *
 * Usage:
 *   npm run demo:reading                  # seed=demo-001, three-card, general
 *   npm run demo:reading -- --seed=foo
 *   npm run demo:reading -- --full
 */
import { generateDeterministicReading } from '../src/server/reading-engine';

function arg(name: string, fallback: string): string {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const seed = arg('seed', 'demo-001');
const topic = arg('topic', 'general') as 'relationship' | 'career' | 'general';
const full = process.argv.includes('--full');

const reading = generateDeterministicReading({ seed, spread: 'three-card', topic });

if (full) {
  console.log(JSON.stringify(reading, null, 2));
} else {
  console.log(
    JSON.stringify(
      {
        seed: reading.seed,
        spread: reading.spread,
        cards: reading.cards,
      },
      null,
      2
    )
  );
}
