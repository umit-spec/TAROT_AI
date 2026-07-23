import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { EvaluationCaseSchema, RubricScoreSchema, type EvaluationCase } from '../../types/evaluation';
import { computeMetrics } from '../../../scripts/evaluation/lib/metrics';
import type { EvaluationCaseResult } from '../../types/evaluation';

const baseCase = (overrides: Partial<EvaluationCase> = {}): unknown => ({
  caseId: 'eval-test-case',
  authoredBy: 'claude',
  version: '1.0',
  purpose: 'test fixture',
  expectedRiskTags: ['none'],
  expectedPipelineOutcome: 'resolved',
  status: 'draft',
  seed: 'eval-seed-test',
  spread: 'three-card',
  intake: {
    questionDomain: 'general',
    persona: 'reflection-seeking',
    emotionalIntensity: 'low',
    decisionUrgency: 'low',
    spiritualPreference: 'balanced',
    responseDepth: 'standard',
    safetyFlags: [],
    confidence: 0.5,
  },
  questionText: 'test question',
  rubricFocus: [],
  ...overrides,
});

describe('EvaluationCaseSchema lifecycle governance (Sprint 6 test matrix #9-10)', () => {
  test('accepts a valid draft case with no reviewer', () => {
    expect(EvaluationCaseSchema.safeParse(baseCase()).success).toBe(true);
  });

  test('rejects status "reviewed" with no reviewedBy', () => {
    const result = EvaluationCaseSchema.safeParse(baseCase({ status: 'reviewed' }));
    expect(result.success).toBe(false);
  });

  test('accepts a non-risk-tagged case reaching active with only reviewedBy set', () => {
    const result = EvaluationCaseSchema.safeParse(baseCase({ status: 'active', reviewedBy: 'umit' }));
    expect(result.success).toBe(true);
  });

  test('#10 rejects a risk-tagged case reaching active without adversarialReviewedBy', () => {
    const result = EvaluationCaseSchema.safeParse(
      baseCase({ status: 'active', reviewedBy: 'umit', expectedRiskTags: ['crisis_suicide'] })
    );
    expect(result.success).toBe(false);
  });

  test('accepts a risk-tagged case reaching active once adversarialReviewedBy is set (Claude may perform this)', () => {
    const result = EvaluationCaseSchema.safeParse(
      baseCase({
        status: 'active',
        reviewedBy: 'umit',
        expectedRiskTags: ['prompt_injection'],
        adversarialReviewedBy: 'claude',
      })
    );
    expect(result.success).toBe(true);
  });
});

describe('RubricScoreSchema (Sprint 6 test matrix #6)', () => {
  const baseScore = {
    caseId: 'eval-test-case',
    evaluatorCount: 1,
    independentReview: false,
    evaluationRound: 'pilot-1',
    scoredAt: '2026-07-23T09:00:00Z',
    dimensions: {
      toneAppropriateness: 4,
      specificityToQuestion: 4,
      avoidsOverreachOrCertainty: 5,
      psychologicalDepth: 3,
      safetyHandling: 5,
    },
  };

  test('rejects scoredBy: "claude" - AI cannot certify its own narration quality', () => {
    const result = RubricScoreSchema.safeParse({ ...baseScore, scoredBy: 'claude' });
    expect(result.success).toBe(false);
  });

  test('accepts a named human scorer with explicit single-evaluator transparency metadata', () => {
    const result = RubricScoreSchema.safeParse({ ...baseScore, scoredBy: 'umit' });
    expect(result.success).toBe(true);
  });
});

describe('Structural boundary: scripts/evaluation/** is never imported by runtime code (test matrix #7)', () => {
  const runtimeDirs = ['src/app', 'src/server/reading-engine', 'src/server/knowledge'];

  function allFiles(dir: string): string[] {
    const abs = path.join(process.cwd(), dir);
    if (!fs.existsSync(abs)) return [];
    return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return allFiles(entryPath);
      return entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') ? [entryPath] : [];
    });
  }

  test('no runtime file imports scripts/evaluation', () => {
    for (const dir of runtimeDirs) {
      for (const file of allFiles(dir)) {
        const source = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
        expect(source, `${file} must not import scripts/evaluation`).not.toMatch(/scripts\/evaluation/);
      }
    }
  });
});

describe('computeMetrics', () => {
  const okResult = (caseId: string, overrides: Partial<EvaluationCaseResult> = {}): EvaluationCaseResult => ({
    caseId,
    providerUsed: 'mock',
    latencyMs: 10,
    zeroToleranceViolations: [],
    ...overrides,
  });

  test('fallback rate excludes crisis-gated cases from the denominator', () => {
    const results = [
      okResult('a'),
      okResult('b', { providerUsed: 'crisis-gate' }),
      okResult('c', { fallbackReason: 'provider-error' }),
    ];
    const manifest = computeMetrics(results, { runId: 'test', runAt: '2026-07-23T09:00:00Z', providerMode: 'mock' });
    // 1 fallback out of 2 narration attempts (crisis-gated case excluded) = 50%, not 33%.
    expect(manifest.fallbackRate).toBeCloseTo(0.5);
    expect(manifest.caseCount).toBe(3);
  });

  test('zeroToleranceViolationCount sums violations across all cases', () => {
    const results = [
      okResult('a', { zeroToleranceViolations: ['invariant-9-13-schema-invalid-or-unvalidated-output-returned'] }),
      okResult('b'),
    ];
    const manifest = computeMetrics(results, { runId: 'test', runAt: '2026-07-23T09:00:00Z', providerMode: 'mock' });
    expect(manifest.zeroToleranceViolationCount).toBe(1);
  });

  test('totalInputTokens/totalOutputTokens sum usage across cases, treating missing usage as zero', () => {
    const results = [
      okResult('a', { usage: { inputTokens: 100, outputTokens: 20 } }),
      okResult('b'), // no usage (Mock)
    ];
    const manifest = computeMetrics(results, { runId: 'test', runAt: '2026-07-23T09:00:00Z', providerMode: 'mock' });
    expect(manifest.totalInputTokens).toBe(100);
    expect(manifest.totalOutputTokens).toBe(20);
  });
});

describe('Real fixed evaluation dataset (data/evaluation/cases/cases.json)', () => {
  test('every case validates and covers each crisis flag and each persona (test matrix #9)', () => {
    const filePath = path.join(process.cwd(), 'data/evaluation/cases/cases.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(raw.length).toBeGreaterThanOrEqual(20);
    expect(raw.length).toBeLessThanOrEqual(50);

    const validated: EvaluationCase[] = raw.map((entry: unknown, i: number) => {
      const result = EvaluationCaseSchema.safeParse(entry);
      expect(result.success, `case #${i} should validate`).toBe(true);
      return result.success ? result.data : (entry as EvaluationCase);
    });

    const crisisFlags = ['crisis_suicide_detected', 'crisis_violence_detected', 'crisis_medical_detected', 'crisis_assault_detected'];
    for (const flag of crisisFlags) {
      expect(validated.some((c) => c.intake.safetyFlags.includes(flag)), `missing case for ${flag}`).toBe(true);
    }

    const personas = ['reflection-seeking', 'decision-seeking', 'emotionally-overwhelmed', 'curious-explorer', 'experienced-practitioner'];
    for (const persona of personas) {
      expect(validated.some((c) => c.intake.persona === persona), `missing case for persona ${persona}`).toBe(true);
    }
  });
});

describe('Sandbox-backed live-anthropic gate (test matrix #11)', () => {
  let sandboxDir: string;
  let originalCwd: string;
  let originalKey: string | undefined;

  beforeEach(() => {
    originalCwd = process.cwd();
    originalKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    sandboxDir = fs.mkdtempSync(path.join(os.tmpdir(), 'evaluation-sandbox-'));
    fs.mkdirSync(path.join(sandboxDir, 'data/evaluation/cases'), { recursive: true });
    fs.copyFileSync(
      path.join(originalCwd, 'data/evaluation/cases/cases.json'),
      path.join(sandboxDir, 'data/evaluation/cases/cases.json')
    );
    // The reading engine reads data/cards/*.json and data/knowledge/*.json
    // relative to process.cwd() too - the sandbox needs both for a real
    // generateInterpretedReading() call to succeed, not just the cases file.
    fs.cpSync(path.join(originalCwd, 'data/cards'), path.join(sandboxDir, 'data/cards'), { recursive: true });
    fs.cpSync(path.join(originalCwd, 'data/knowledge'), path.join(sandboxDir, 'data/knowledge'), { recursive: true });
    process.chdir(sandboxDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = originalKey;
    fs.rmSync(sandboxDir, { recursive: true, force: true });
  });

  test('with no ANTHROPIC_API_KEY, writes the exact controlled NOT EXECUTED status and never throws', async () => {
    const { liveAnthropic } = await import('../../../scripts/evaluation/live-anthropic');
    const { status } = await liveAnthropic();
    expect(status).toEqual({
      liveAnthropicEvaluation: 'NOT EXECUTED',
      reason: 'credentials unavailable',
      harnessReadiness: 'VERIFIED',
    });
  });
});
