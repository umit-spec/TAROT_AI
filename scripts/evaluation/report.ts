#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { runDir } from './lib/paths';
import type { EvaluationCaseResult, EvaluationRunManifest } from '../../src/types/evaluation';

export function renderReport(manifest: EvaluationRunManifest, results: EvaluationCaseResult[]): string {
  const lines: string[] = [];
  lines.push(`# Evaluation Run Report — ${manifest.runId}`);
  lines.push('');
  lines.push(`- **Provider mode:** ${manifest.providerMode}`);
  lines.push(`- **Run at:** ${manifest.runAt}`);
  lines.push(`- **Cases:** ${manifest.caseCount}`);
  lines.push(`- **Fallback rate:** ${(manifest.fallbackRate * 100).toFixed(1)}%`);
  for (const [reason, rate] of Object.entries(manifest.fallbackRateByReason)) {
    lines.push(`  - ${reason}: ${(rate * 100).toFixed(1)}%`);
  }
  lines.push(`- **Latency p50 / p95:** ${manifest.latencyP50Ms.toFixed(0)}ms / ${manifest.latencyP95Ms.toFixed(0)}ms`);
  lines.push(`- **Total tokens:** ${manifest.totalInputTokens} in / ${manifest.totalOutputTokens} out`);
  lines.push(
    `- **Zero-tolerance violations:** ${manifest.zeroToleranceViolationCount}${manifest.zeroToleranceViolationCount > 0 ? ' — RUN FAILED' : ' — none'}`
  );
  lines.push('');
  lines.push('## Per-case results');
  lines.push('');
  lines.push('| caseId | providerUsed | fallbackReason | latencyMs | violations |');
  lines.push('|---|---|---|---|---|');
  for (const r of results) {
    lines.push(
      `| ${r.caseId} | ${r.providerUsed} | ${r.fallbackReason ?? '-'} | ${r.latencyMs.toFixed(1)} | ${r.zeroToleranceViolations.length > 0 ? r.zeroToleranceViolations.join(', ') : '-'} |`
    );
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  const runId = process.argv[2];
  if (!runId) {
    throw new Error('Usage: report.ts <runId>');
  }
  const dir = runDir(runId);
  const manifest: EvaluationRunManifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf-8'));
  const results: EvaluationCaseResult[] = JSON.parse(fs.readFileSync(path.join(dir, 'results.json'), 'utf-8'));
  const report = renderReport(manifest, results);
  const reportPath = path.join(dir, 'report.md');
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`Report written: ${reportPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (err) {
    console.error(`evaluation:report failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
