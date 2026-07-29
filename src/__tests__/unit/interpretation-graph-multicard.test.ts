import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { describe, expect, test } from 'vitest';

const ROOT = process.cwd();
const TOOLS = path.join(ROOT, 'tools/interpretation-graph');
const PYTHON = 'python3';

function runPython(script: string, args: string[] = []): string {
  return execFileSync(PYTHON, [path.join(TOOLS, script), ...args], {
    cwd: ROOT,
    encoding: 'utf-8',
  });
}

function compose(input: Record<string, unknown>): any {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ig3b-'));
  const file = path.join(dir, 'input.json');
  fs.writeFileSync(file, JSON.stringify(input));
  try {
    return JSON.parse(runPython('compose_bounded_prompt.py', [file]));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const cards = ['16-tower', '01-magician'] as const;
const positions = ['past', 'present', 'direction'] as const;
const contexts = [
  'career',
  'relationship',
  'decision',
  'family',
  'boundaries',
  'self-awareness',
  'uncertainty',
  'change',
] as const;
const signals = [
  'financial-security-concern',
  'decision-uncertainty',
  'control-scope-clarification',
  'change-hesitation',
  'responsibility-sustainability',
  'uncertainty-discomfort',
  'loss-concern',
  'external-evaluation-pressure',
  'boundary-expression-need',
  'current-structure-attachment',
] as const;

function baseInput(cardId: string): Record<string, unknown> {
  return {
    cardId,
    position: 'present',
    topic: null,
    goal: null,
    explicitSignals: [],
    relationshipType: null,
    userQuestion: 'Bu durumu daha açık değerlendirmek için nelere bakabilirim?',
    presentationPreference: 'concise',
  };
}

const routingCases = cards.flatMap((cardId) =>
  positions.flatMap((position) => contexts.map((topic) => ({ cardId, position, topic })))
);

describe('IG-3B — multicard graph validation', () => {
  test('exact multicard graph validator passes', () => {
    expect(runPython('validate_multicard_graph.py')).toMatch(/PASS/);
  });

  test('two-card offline evaluator passes', () => {
    expect(runPython('evaluate_multicard_offline.py')).toMatch(/PASS-WITH-NOTES/);
  });
});

describe('IG-3B — 48 card × position × context routing cases', () => {
  test.each(routingCases)('$cardId / $position / $topic', ({ cardId, position, topic }) => {
    const bundle = compose({ ...baseInput(cardId), position, topic });
    expect(bundle.cardId).toBe(cardId);
    expect(bundle.position).toBe(position);
    expect(bundle.contextRefs.position).toBe(position);
    expect(bundle.contextRefs.topic).toBe(topic);
    expect(bundle.templateVersion).toBe('interpretation-bounded-v1');
    expect(bundle.provenance.runtimeEnabled).toBe(false);
    expect(bundle.provenance.liveModelValidated).toBe(false);
  });
});

describe('IG-3B — Magician signal routing', () => {
  test.each(signals)('%s is accepted only as an explicit signal', (signalId) => {
    const bundle = compose({
      ...baseInput('01-magician'),
      explicitSignals: [
        {
          signalId,
          source: 'explicit-user-selection',
          confidence: 'explicit',
        },
      ],
    });
    expect(bundle.contextRefs.signals).toEqual([signalId]);
    expect(bundle.userMessage.boundedContext.signals[0].signalRef).toBe(signalId);
  });
});

describe('IG-3B — cross-card isolation and integrity', () => {
  const shared = {
    position: 'direction',
    topic: 'decision',
    goal: 'weigh-decision',
    explicitSignals: [
      {
        signalId: 'decision-uncertainty',
        source: 'explicit-user-selection',
        confidence: 'explicit',
      },
    ],
    relationshipType: 'reframing',
    userQuestion: 'Aynı sentetik soru',
    presentationPreference: 'concise',
  };

  test('same question preserves questionHash across cards', () => {
    const tower = compose({ ...baseInput('16-tower'), ...shared, cardId: '16-tower' });
    const magician = compose({ ...baseInput('01-magician'), ...shared, cardId: '01-magician' });
    expect(tower.integrity.questionHash).toBe(magician.integrity.questionHash);
  });

  test('card change produces a different contextHash', () => {
    const tower = compose({ ...baseInput('16-tower'), ...shared, cardId: '16-tower' });
    const magician = compose({ ...baseInput('01-magician'), ...shared, cardId: '01-magician' });
    expect(tower.integrity.contextHash).not.toBe(magician.integrity.contextHash);
  });

  test('system prompt is card-independent for the same position', () => {
    const tower = compose({ ...baseInput('16-tower'), ...shared, cardId: '16-tower' });
    const magician = compose({ ...baseInput('01-magician'), ...shared, cardId: '01-magician' });
    expect(tower.systemPrompt).toBe(magician.systemPrompt);
  });

  test('bounded context contains the selected card only', () => {
    const tower = compose({ ...baseInput('16-tower'), ...shared, cardId: '16-tower' });
    const magician = compose({ ...baseInput('01-magician'), ...shared, cardId: '01-magician' });
    expect(tower.userMessage.boundedContext.card.id).toBe('16-tower');
    expect(magician.userMessage.boundedContext.card.id).toBe('01-magician');
    expect(JSON.stringify(tower.userMessage.boundedContext)).not.toContain('Büyücü, bir fikir veya niyet');
    expect(JSON.stringify(magician.userMessage.boundedContext)).not.toContain('Kule, güvenilir veya değişmez');
  });
});
