#!/usr/bin/env tsx
import path from 'path';
import { ClaudeProvider } from '../../src/server/reading-engine';
import { loadClaudeProviderConfig, ClaudeConfigError } from '../../src/server/reading-engine/providers/claude';
import { loadCases, writeJson } from './lib/io';
import { runDir, newRunId } from './lib/paths';
import { runCase } from './lib/run-case';
import { computeMetrics } from './lib/metrics';
import { writeRawArtifact, type RawCaseArtifact } from './lib/raw';
import { run as runMock } from './run';
import type { LiveAnthropicStatus } from '../../src/types/evaluation';

/**
 * The real-provider gate - a separate command from run.ts, never silently
 * substituted for it. See Sprint 6 plan §1.3: if ANTHROPIC_API_KEY is
 * absent, this writes a controlled, honest status artifact and exits 0 -
 * a missing key in an environment that was never given one is expected,
 * not exceptional. It never fakes a live result.
 */
export async function liveAnthropic(options: { retainRaw?: boolean } = {}): Promise<{
  runId: string;
  status: LiveAnthropicStatus;
}> {
  // harnessReadiness can only be VERIFIED if the Mock pass - proving the
  // harness itself works - actually just succeeded, in this same invocation.
  const mockOutcome = await runMock('live-anthropic-readiness-check');
  const harnessReady = mockOutcome.manifest.zeroToleranceViolationCount === 0;

  let hasKey = true;
  let model: string | undefined;
  let apiKey: string | undefined;
  try {
    const config = loadClaudeProviderConfig();
    model = config.model;
    apiKey = config.apiKey; // used only as an exact-match scrub secret, never logged
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
  const extraSecrets = apiKey ? [apiKey] : [];

  // Raw capture is OFF by default (Product Owner decision 3). Only --retain-raw
  // writes the git-ignored, scrubbed per-case artifacts.
  const captureRaw = options.retainRaw
    ? (artifact: RawCaseArtifact) => writeRawArtifact(runId, artifact, extraSecrets)
    : undefined;

  const results = [];
  for (const evalCase of cases) {
    results.push(await runCase(evalCase, provider, { captureRaw, providerLabel: 'live-anthropic', model }));
  }
  const manifest = computeMetrics(results, {
    runId,
    runAt: new Date().toISOString(),
    providerMode: 'live-anthropic',
    model,
  });
  writeJson(path.join(runDir(runId), 'results.json'), results);
  writeJson(path.join(runDir(runId), 'manifest.json'), manifest);

  const status: LiveAnthropicStatus = { liveAnthropicEvaluation: 'EXECUTED', harnessReadiness: 'VERIFIED' };
  writeJson(path.join(runDir(runId), 'live-anthropic-status.json'), status);
  return { runId, status };
}

function main() {
  const retainRaw = process.argv.includes('--retain-raw');
  liveAnthropic({ retainRaw })
    .then(({ runId, status }) => {
      console.log(`Live Anthropic evaluation: ${status.liveAnthropicEvaluation}`);
      if (status.reason) console.log(`Reason: ${status.reason}`);
      console.log(`Harness readiness: ${status.harnessReadiness}`);
      console.log(`Raw payload retention: ${retainRaw ? 'ON (--retain-raw) - git-ignored, run cleanup-raw within 7 days' : 'OFF (default)'}`);
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
