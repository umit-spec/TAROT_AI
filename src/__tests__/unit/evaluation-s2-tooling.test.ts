import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { computeCost, MODEL_RATES } from '../../../scripts/evaluation/lib/pricing';
import { scanForSecrets, hasSecrets } from '../../../scripts/evaluation/lib/scrub';
import { writeRawArtifact, loadRawArtifacts, cleanupRaw, RawArtifactSecretError, type RawCaseArtifact } from '../../../scripts/evaluation/lib/raw';
import { runPreflight } from '../../../scripts/evaluation/preflight';
import { renderCostReport } from '../../../scripts/evaluation/cost';
import { build as buildComparison, unblind } from '../../../scripts/evaluation/compare';
import type { EvaluationRunManifest, EvaluationCaseResult } from '../../types/evaluation';

describe('pricing (evaluation:cost)', () => {
  it('applies claude-sonnet-5 introductory rate on/before 2026-08-31', () => {
    const c = computeCost('claude-sonnet-5', 1_000_000, 1_000_000, '2026-07-23T00:00:00.000Z');
    expect(c.rateApplied).toBe('introductory');
    expect(c.inputPerMillion).toBe(2.0);
    expect(c.outputPerMillion).toBe(10.0);
    expect(c.totalCostUsd).toBeCloseTo(12.0, 6);
  });

  it('applies standard rate after the intro window', () => {
    const c = computeCost('claude-sonnet-5', 1_000_000, 1_000_000, '2026-09-01T00:00:00.000Z');
    expect(c.rateApplied).toBe('standard');
    expect(c.totalCostUsd).toBeCloseTo(18.0, 6);
  });

  it('reports an unknown model as unpriced instead of guessing', () => {
    const c = computeCost('some-unknown-model', 100, 100, '2026-07-23T00:00:00.000Z');
    expect(c.modelKnown).toBe(false);
    expect(c.totalCostUsd).toBeNull();
  });

  it('knows claude-sonnet-5 in the rate table', () => {
    expect(MODEL_RATES['claude-sonnet-5']).toBeDefined();
  });
});

describe('secret scrubber', () => {
  it('catches an sk-ant- key and never returns the raw secret', () => {
    const secret = 'sk-ant-api03-ABCdef123456789';
    const findings = scanForSecrets(`prefix ${secret} suffix`);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].masked).not.toContain(secret);
  });

  it('catches an exact env-secret match', () => {
    expect(hasSecrets('the value is XYZ-super-secret-123', ['XYZ-super-secret-123'])).toBe(true);
  });

  it('passes clean text', () => {
    expect(hasSecrets('The Hermit relates to introspection.')).toBe(false);
  });
});

describe('raw artifacts', () => {
  let sandbox: string;
  let cwd: string;
  beforeEach(() => {
    cwd = process.cwd();
    sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 's2-raw-'));
    process.chdir(sandbox);
  });
  afterEach(() => {
    process.chdir(cwd);
    fs.rmSync(sandbox, { recursive: true, force: true });
  });

  const artifact = (caseId: string, question: string): RawCaseArtifact => ({
    caseId,
    provider: 'live-anthropic',
    model: 'claude-sonnet-5',
    request: { seed: 's', spread: 'three-card', intake: {}, questionText: question },
    response: { providerUsed: 'claude', output: { note: 'narration text' }, usage: { inputTokens: 10, outputTokens: 20 } },
    latencyMs: 12,
  });

  it('writes and reloads a clean artifact', () => {
    writeRawArtifact('run-1', artifact('case-a', 'a reflective question'));
    const loaded = loadRawArtifacts('run-1');
    expect(loaded).toHaveLength(1);
    expect(loaded[0].caseId).toBe('case-a');
  });

  it('refuses to write an artifact containing a secret', () => {
    expect(() => writeRawArtifact('run-1', artifact('case-b', 'sk-ant-api03-LEAKED000000'))).toThrow(RawArtifactSecretError);
  });

  it('cleanup removes raw folders older than the retention window', () => {
    writeRawArtifact('run-old', artifact('c', 'q'));
    const rawPath = path.join(sandbox, 'data', 'evaluation', 'runs', 'run-old', 'raw');
    const old = Date.now() / 1000 - 30 * 24 * 60 * 60; // 30 days ago
    fs.utimesSync(rawPath, old, old);
    const { removed } = cleanupRaw(7);
    expect(removed).toContain('run-old');
    expect(fs.existsSync(rawPath)).toBe(false);
  });
});

describe('preflight', () => {
  it('reports key presence without exposing it, and passes hard checks in this repo', () => {
    const present = runPreflight({ ANTHROPIC_API_KEY: 'sk-ant-whatever' });
    const absent = runPreflight({});
    const keyCheck = (checks: ReturnType<typeof runPreflight>) => checks.find((c) => c.name === 'api-key-present')!;
    expect(keyCheck(present).detail).toBe('present: true');
    expect(keyCheck(absent).detail).toContain('present: false');
    // none of the returned details leak a key value
    for (const c of present) expect(c.detail).not.toContain('sk-ant-whatever');
    // hard checks (gitignore, model, scrubber self-test) pass against the real repo
    const hardFails = runPreflight({ ANTHROPIC_API_KEY: 'x' }).filter((c) => c.hard && !c.ok);
    expect(hardFails).toHaveLength(0);
  });
});

describe('cost report', () => {
  const manifest: EvaluationRunManifest = {
    runId: 'live-anthropic-test',
    runAt: '2026-07-23T00:00:00.000Z',
    providerMode: 'live-anthropic',
    model: 'claude-sonnet-5',
    caseCount: 3,
    fallbackRate: 0.33,
    fallbackRateByReason: { 'red-line-rejected': 0.33, 'schema-invalid': 0, 'provider-error': 0 },
    latencyP50Ms: 900,
    latencyP95Ms: 1800,
    totalInputTokens: 3000,
    totalOutputTokens: 1500,
    zeroToleranceViolationCount: 0,
  };
  const results: EvaluationCaseResult[] = [
    { caseId: 'a', providerUsed: 'claude', promptVersionUsed: 'v1', usage: { inputTokens: 1000, outputTokens: 500 }, latencyMs: 900, zeroToleranceViolations: [] },
    { caseId: 'b', providerUsed: 'mock', promptVersionUsed: 'v1', fallbackReason: 'red-line-rejected', latencyMs: 1000, zeroToleranceViolations: [] },
    { caseId: 'c', providerUsed: 'crisis-gate', latencyMs: 1, zeroToleranceViolations: [] },
  ];

  it('records every required field including model, cost, and red-line rejections', () => {
    const report = renderCostReport(manifest, results);
    expect(report).toContain('claude-sonnet-5');
    expect(report).toContain('Total cost (USD)');
    expect(report).toContain('red-line rejections');
    expect(report).toContain('Zero-tolerance invariant violations');
    expect(report).toContain('$'); // a real priced number, intro rate in effect on this date
  });
});

describe('blind comparison', () => {
  let sandbox: string;
  let cwd: string;
  beforeEach(() => {
    cwd = process.cwd();
    sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 's2-cmp-'));
    process.chdir(sandbox);
    const live = (caseId: string): RawCaseArtifact => ({
      caseId, provider: 'live-anthropic', model: 'claude-sonnet-5',
      request: { seed: 's', spread: 'three-card', intake: {}, questionText: 'q' },
      response: { providerUsed: 'claude', output: { text: `live ${caseId}` }, usage: { inputTokens: 1, outputTokens: 1 } },
      latencyMs: 1,
    });
    const mock = (caseId: string): RawCaseArtifact => ({
      caseId, provider: 'mock',
      request: { seed: 's', spread: 'three-card', intake: {}, questionText: 'q' },
      response: { providerUsed: 'mock', output: { text: `mock ${caseId}` } },
      latencyMs: 1,
    });
    for (const id of ['x', 'y']) {
      writeRawArtifact('live-run', live(id));
      writeRawArtifact('mock-run', mock(id));
    }
  });
  afterEach(() => {
    process.chdir(cwd);
    fs.rmSync(sandbox, { recursive: true, force: true });
  });

  it('builds a blind sheet + separate unblind map, and unblind tallies correctly', () => {
    const { dir, pairCount } = buildComparison('live-run', 'mock-run');
    expect(pairCount).toBe(2);
    expect(fs.existsSync(path.join(dir, 'scoring-sheet.json'))).toBe(true);
    expect(fs.existsSync(path.join(dir, 'unblind-map.json'))).toBe(true);

    // Simulate a human preferring option A on every pair; unblind must map each
    // A back to whichever provider it actually was.
    const map = JSON.parse(fs.readFileSync(path.join(dir, 'unblind-map.json'), 'utf-8')) as { pairId: string; A: string }[];
    const scores = map.map((m) => ({ pairId: m.pairId, preferred: 'A' as const }));
    const r = unblind(dir, scores);
    const expectedLiveWins = map.filter((m) => m.A === 'live-anthropic').length;
    expect(r.liveWins).toBe(expectedLiveWins);
    expect(r.liveWins + r.mockWins).toBe(2);
  });
});
