#!/usr/bin/env tsx
/**
 * Sprint 3 exit proof: hits the actual route handler in-process (no dev
 * server, no real network) - proves the full pipeline (request validation
 * -> classifyIntake -> crisis gate -> Reading Engine -> Knowledge Layer ->
 * narration provider -> response) works end to end.
 *
 * Usage:
 *   npm run demo:api                              # seed=demo-001, neutral question
 *   npm run demo:api -- --question="Artık yaşayamam, kendime zarar vermeyi düşünüyorum."
 *   npm run demo:api -- --seed=foo --topicHint=career
 */
import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/readings/route';

function arg(name: string, fallback: string): string {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const seed = arg('seed', 'demo-001');
const question = arg('question', 'İşimde yön değiştirmeli miyim?');
const topicHint = arg('topicHint', '');

const body: Record<string, unknown> = { seed, question };
if (topicHint) body.topicHint = topicHint;

async function main() {
  const request = new NextRequest('http://localhost/api/readings', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });

  const response = await POST(request);
  const json = await response.json();
  console.log(JSON.stringify(json, null, 2));
}

main();
