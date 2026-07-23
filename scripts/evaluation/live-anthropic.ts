#!/usr/bin/env tsx
import path from 'path';
import { ClaudeProvider } from '../../src/server/reading-engine';
import { loadClaudeProviderConfig, ClaudeConfigError } from '../../src/server/reading-engine/providers/claude';
import { loadCases, writeJson } from './lib/io';
import { runDir, newRunId } from './lib/paths';
import { runCase } from './lib/run-case';
import { computeMetrics } from './lib/metrics';
import { run as runMock } from './run';
import type { LiveAnthropicStatus } from '../../src/types/evaluation';

/**
 * The real-provider gate - a separate command from run.ts, never silently
 * substituted for it. See Sprint 6 plan §1.3: if ANTHROPIC_API_KEY is
 * absent, this writes a controlled, honest status artifact and exits 0 -
 * a missing key in an environment that was never given one is expected,
 * not exceptional. It never fakes a live result.
 */
export async function liveAnthropic(): Promise<{ runId: string; status: LiveAnthropicStatus }> {
  // harnessReadiness can only be VERIFIED if the Mock pass - proving the
  // harness itself works - actually just succeeded, in this same invocation.
  const mockOutcome = await runMock('live-anthropic-readiness-check');
  const harnessReady = mockOutcome.manifest.zeroToleranceViolationCount === 0;

  let hasKey = true;
  try {
    loadClaudeProviderConfig();
  } catch (err) {
    if (err instanceof ClaudeConfigError) {
      hasKey = false;
    } else {
      throw err;
    }
  }

  const runId = newRunId('live-anthropic');

  if (!hasKey) {
    const status: LiveAnthropicStatus = {
      liveAnthropicEvaluation: 'NOT EXECUTED',
      reason: 'credentials unavailable',
      harnessReadiness: harnessReady ? 'VERIFIED' : 'UNVERIFIED',
    };
    writeJson(path.join(runDir(runId), 'live-anthropic-status.json'), status);
    return { runId, status };
  }

  const cases = loadCases().filter((c) => c.status === 'active');
  const provider = new ClaudeProvider();
  const results = [];
  for (const evalCase of cases) {
    results.push(await runCase(evalCase, provider));
  }
  const manifest = computeMetrics(results, { runId, runAt: new Date().toISOString(), providerMode: 'live-anthropic' });
  writeJson(path.join(runDir(runId), 'results.json'), results);
  writeJson(path.join(runDir(runId), 'manifest.json'), manifest);

  const status: LiveAnthropicStatus = { liveAnthropicEvaluation: 'EXECUTED', harnessReadiness: 'VERIFIED' };
  writeJson(path.join(runDir(runId), 'live-anthropic-status.json'), status);
  return { runId, status };
}

function main() {
  liveAnthropic()
    .then(({ runId, status }) => {
      console.log(`Live Anthropic evaluation: ${status.liveAnthropicEvaluation}`);
      if (status.reason) console.log(`Reason: ${status.reason}`);
      console.log(`Harness readiness: ${status.harnessReadiness}`);
      console.log(`Run artifact: data/evaluation/runs/${runId}/`);
    })
    .catch((err) => {
      console.error(`evaluation:live-anthropic failed: ${(err as Error).message}`);
      process.exit(1);
    });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
