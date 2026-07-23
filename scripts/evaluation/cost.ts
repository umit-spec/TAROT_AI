#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { runDir } from './lib/paths';
import { computeCost } from './lib/pricing';
import type { EvaluationCaseResult, EvaluationRunManifest } from '../../src/types/evaluation';

/**
 * Cost calculator + full live-evaluation report (Sprint S2, Product Owner
 * decision 2). Reads a scrubbed run folder and records EVERY required field:
 * model name, run date, prompt version(s), input/output tokens, total USD cost,
 * p50/p95 latency, fallback reasons, schema failures, red-line rejections, and
 * zero-tolerance invariant results. Derived only - no secrets, reproducible.
 */
export function renderCostReport(manifest: EvaluationRunManifest, results: EvaluationCaseResult[]): string {
  const model = manifest.model ?? 'unknown';
  const cost = computeCost(model, manifest.totalInputTokens, manifest.totalOutputTokens, manifest.runAt);

  const schemaFailures = results.filter((r) => r.fallbackReason === 'schema-invalid').length;
  const redLineRejections = results.filter((r) => r.fallbackReason === 'red-line-rejected').length;
  const providerErrors = results.filter((r) => r.fallbackReason === 'provider-error').length;
  const promptVersions = Array.from(
    new Set(results.map((r) => r.promptVersionUsed).filter((v): v is string => Boolean(v))),
  );
  const activeCases = results.filter((r) => r.providerUsed !== 'crisis-gate').length;
  const usd = (n: number | null) => (n === null ? 'n/a (model unpriced)' : `$${n.toFixed(6)}`);

  const lines: string[] = [];
  lines.push(`# Live Model Evaluation Report — ${manifest.runId}`);
  lines.push('');
  lines.push(manifest.providerMode === 'mock'
    ? '> **Provider mode: mock.** Token/cost figures are structurally zero — this is a harness-mechanics run, not a real-model baseline.'
    : '> **Provider mode: live-anthropic.** Engineering baseline (founder-scored where founder-scored), not independent validation.');
  lines.push('');
  lines.push('## Required fields');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('|---|---|');
  lines.push(`| Model name | ${model} |`);
  lines.push(`| Run date (UTC) | ${manifest.runAt} |`);
  lines.push(`| Prompt version(s) | ${promptVersions.length ? promptVersions.join(', ') : 'n/a'} |`);
  lines.push(`| Cases (total / narration-attempted) | ${manifest.caseCount} / ${activeCases} |`);
  lines.push(`| Input tokens | ${manifest.totalInputTokens} |`);
  lines.push(`| Output tokens | ${manifest.totalOutputTokens} |`);
  lines.push(`| Rate applied | ${cost.rateApplied}${cost.inputPerMillion !== null ? ` ($${cost.inputPerMillion}/$${cost.outputPerMillion} per 1M in/out)` : ''} |`);
  lines.push(`| Input cost | ${usd(cost.inputCostUsd)} |`);
  lines.push(`| Output cost | ${usd(cost.outputCostUsd)} |`);
  lines.push(`| **Total cost (USD)** | **${usd(cost.totalCostUsd)}** |`);
  lines.push(`| Cost per case (narration-attempted) | ${cost.totalCostUsd !== null && activeCases > 0 ? usd(cost.totalCostUsd / activeCases) : 'n/a'} |`);
  lines.push(`| p50 / p95 latency | ${manifest.latencyP50Ms.toFixed(0)}ms / ${manifest.latencyP95Ms.toFixed(0)}ms |`);
  lines.push(`| Fallback rate | ${(manifest.fallbackRate * 100).toFixed(1)}% |`);
  lines.push(`| — red-line rejections | ${redLineRejections} |`);
  lines.push(`| — schema failures | ${schemaFailures} |`);
  lines.push(`| — provider errors | ${providerErrors} |`);
  lines.push(`| **Zero-tolerance invariant violations** | **${manifest.zeroToleranceViolationCount}** ${manifest.zeroToleranceViolationCount === 0 ? '(none)' : '— RUN FAILED'} |`);
  lines.push('');
  if (!cost.modelKnown && manifest.providerMode === 'live-anthropic') {
    lines.push(`> ⚠️ Model \`${model}\` is not in the pricing table — add its rate to \`scripts/evaluation/lib/pricing.ts\` to price this run.`);
    lines.push('');
  }
  lines.push('## Honest status');
  lines.push('');
  lines.push(manifest.providerMode === 'live-anthropic'
    ? 'This is a real-provider **engineering baseline**. Narration quality is not certified here — score it with the RubricScore schema (human `scoredBy`) and the blind Mock-vs-Claude comparison before any PASS.'
    : 'Mock run — proves the report mechanics only. Real quality/cost exists only once `evaluation:live-anthropic` runs against a real key.');
  lines.push('');
  return lines.join('\n');
}

function main() {
  const runId = process.argv[2];
  if (!runId) throw new Error('Usage: cost.ts <runId>');
  const dir = runDir(runId);
  const manifest: EvaluationRunManifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf-8'));
  const results: EvaluationCaseResult[] = JSON.parse(fs.readFileSync(path.join(dir, 'results.json'), 'utf-8'));
  const report = renderCostReport(manifest, results);
  const out = path.join(dir, 'cost-report.md');
  fs.writeFileSync(out, report, 'utf-8');
  console.log(`Cost report written: ${path.relative(process.cwd(), out)}`);
  console.log(report);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (err) {
    console.error(`evaluation:cost failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
