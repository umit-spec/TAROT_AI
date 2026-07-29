import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { describe, expect, test } from 'vitest';

const ROOT = process.cwd();
const TOOLS = path.join(ROOT, 'tools/interpretation-graph');
const EVALUATION = path.join(ROOT, 'data/interpretation-graph/evaluation');
const PYTHON = 'python3';

function runPython(script: string, args: string[] = []): string {
  return execFileSync(PYTHON, [path.join(TOOLS, script), ...args], {
    cwd: ROOT,
    encoding: 'utf-8',
  });
}

function writeTempJson(value: unknown, prefix = 'ig3b-'): { dir: string; file: string } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const file = path.join(dir, 'input.json');
  fs.writeFileSync(file, JSON.stringify(value));
  return { dir, file };
}

function compose(input: Record<string, unknown>): any {
  const { dir, file } = writeTempJson(input);
  try {
    return JSON.parse(runPython('compose_bounded_prompt.py', [file]));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function composeFailure(input: Record<string, unknown>): string {
  const { dir, file } = writeTempJson(input, 'ig3b-fail-');
  try {
    execFileSync(PYTHON, [path.join(TOOLS, 'compose_bounded_prompt.py'), file], {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return '';
  } catch (error: any) {
    return String(error.stderr ?? '');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function validateOutput(output: unknown, refs: unknown, preference: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ig3b-output-'));
  const outputFile = path.join(dir, 'output.json');
  const refsFile = path.join(dir, 'refs.json');
  fs.writeFileSync(outputFile, JSON.stringify(output));
  fs.writeFileSync(refsFile, JSON.stringify(refs));
  try {
    return runPython('validate_interpretation_output.py', [outputFile, refsFile, preference]);
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

const routingFixture = JSON.parse(
  fs.readFileSync(path.join(EVALUATION, 'magician-routing-cases.json'), 'utf-8')
);
const goldenFixture = JSON.parse(
  fs.readFileSync(path.join(EVALUATION, 'magician-golden-cases.json'), 'utf-8')
);
const adversarialFixture = JSON.parse(
  fs.readFileSync(path.join(EVALUATION, 'magician-adversarial-cases.json'), 'utf-8')
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

describe('IG-3B — committed Magician fixture coverage', () => {
  test('fixture counts and coverage meet the phase contract', () => {
    expect(routingFixture.cases).toHaveLength(48);
    expect(routingFixture.negativeCases).toHaveLength(4);
    expect(goldenFixture.cases).toHaveLength(12);
    expect(adversarialFixture.cases).toHaveLength(12);
    expect(new Set(routingFixture.cases.map((item: any) => item.input.position))).toEqual(
      new Set(['past', 'present', 'direction'])
    );
    expect(new Set(routingFixture.cases.map((item: any) => item.input.topic).filter(Boolean))).toEqual(
      new Set(contexts)
    );
  });

  test.each(routingFixture.cases)('$id composes with the committed expected refs', (fixture: any) => {
    const bundle = compose(fixture.input);
    expect(bundle.cardId).toBe('01-magician');
    if ('position' in fixture.expected) expect(bundle.contextRefs.position).toBe(fixture.expected.position);
    if ('topic' in fixture.expected) expect(bundle.contextRefs.topic).toBe(fixture.expected.topic);
    if ('goal' in fixture.expected) expect(bundle.contextRefs.goal).toBe(fixture.expected.goal);
    if ('signals' in fixture.expected) expect(bundle.contextRefs.signals).toEqual(fixture.expected.signals);
    if ('relationship' in fixture.expected) expect(bundle.contextRefs.relationship).toBe(fixture.expected.relationship);
  });

  test.each(routingFixture.negativeCases)('$id is rejected with its stable error code', (fixture: any) => {
    expect(composeFailure(fixture.input)).toContain(fixture.expected.errorCode);
  });

  test.each(goldenFixture.cases)('$id validates against the real output contract', (fixture: any) => {
    const bundle = compose(fixture.input);
    expect(fixture.output.usedContextRefs).toEqual({
      cardId: bundle.cardId,
      position: bundle.contextRefs.position,
      topic: bundle.contextRefs.topic,
      goal: bundle.contextRefs.goal,
      signals: bundle.contextRefs.signals,
      relationship: bundle.contextRefs.relationship,
    });
    expect(
      validateOutput(
        fixture.output,
        fixture.output.usedContextRefs,
        goldenFixture.presentationPreference
      )
    ).toMatch(/VALID/);
  });

  test.each(adversarialFixture.cases)('$id triggers the expected governed hard gate', (fixture: any) => {
    const result = JSON.parse(
      runPython('check_hard_gates_cli.py', [fixture.text, '--direction'])
    );
    expect(result).toContain(fixture.expectedGate);
  });
});
