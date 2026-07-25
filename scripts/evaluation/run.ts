#!/usr/bin/env tsx
import path from 'path';
import { MockProvider } from '../../src/server/reading-engine';
import { loadCases, writeJson } from './lib/io';
import { runDir, newRunId } from './lib/paths';
import { runCase } from './lib/run-case';
import { computeMetrics } from './lib/metrics';
import type { EvaluationCaseResult } from '../../src/types/evaluation';

export interface RunOutcome {
  runId: string;
  results: EvaluationCaseResult[];
  manifest: ReturnType<typeof computeMetrics>;
}

/**
 * Runs every 'active' evaluation case against MockProvider - the one
 * provider always available in any environment, credentials or not. Never
 * writes over a prior run; each invocation gets its own timestamped folder
 * under data/evaluation/runs/, so historical comparisons stay possible.
 */
export async function run(runIdPrefix = 'mock'): Promise<RunOutcome> {
  const cases = loadCases().filter((c) => c.status === 'active');
  const provider = new MockProvider();

  const results: EvaluationCaseResult[] = [];
  for (const evalCase of cases) {
    results.push(await runCase(evalCase, provider));
  }

  const runId = newRunId(runIdPrefix);
  const manifest = computeMetrics(results, { runId, runAt: new Date().toISOString(), providerMode: 'mock' });

  writeJson(path.join(runDir(runId), 'results.json'), results);
  writeJson(path.join(runDir(runId), 'manifest.json'), manifest);

  return { runId, results, manifest };
}

function main() {
  run()
    .then(({ runId, manifest }) => {
      console.log(`Evaluation run complete: ${runId}`);
      console.log(`  cases: ${manifest.caseCount}, fallback rate: ${(manifest.fallbackRate * 100).toFixed(1)}%`);
      console.log(`  latency p50/p95: ${manifest.latencyP50Ms.toFixed(0)}ms / ${manifest.latencyP95Ms.toFixed(0)}ms`);
      console.log(`  zero-tolerance violations: ${manifest.zeroToleranceViolationCount}`);
      if (manifest.zeroToleranceViolationCount > 0) {
        console.error('FAILED: zero-tolerance security/architecture invariant violated - see results.json');
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error(`evaluation:run failed: ${(err as Error).message}`);
      process.exit(1);
    });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
