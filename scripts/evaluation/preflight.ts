#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { DEFAULT_MODEL } from '../../src/server/reading-engine/providers/claude/config';
import { scanForSecrets } from './lib/scrub';

/**
 * Runs BEFORE a real live Anthropic run (Sprint S2, Product Owner decision).
 * Verifies the environment is safe without ever printing the key. A failed
 * hard check exits non-zero so a run never proceeds into an unsafe state.
 */
export interface PreflightCheck {
  name: string;
  ok: boolean;
  detail: string;
  hard: boolean; // a failed hard check blocks the run
}

export function runPreflight(
  env: Record<string, string | undefined> = process.env,
  repoRoot: string = process.cwd(),
): PreflightCheck[] {
  const checks: PreflightCheck[] = [];

  // 1. Key presence - report only present:true/false, NEVER the value or its length.
  const keyPresent = typeof env.ANTHROPIC_API_KEY === 'string' && env.ANTHROPIC_API_KEY.trim() !== '';
  checks.push({
    name: 'api-key-present',
    ok: keyPresent,
    detail: keyPresent ? 'present: true' : 'present: false (live run will honestly report NOT EXECUTED)',
    hard: false, // absence is a valid, honest state - not a failure
  });

  // 2. .gitignore covers .env* and the raw artifact path.
  const gitignore = readIfExists(path.join(repoRoot, '.gitignore'));
  const ignoresEnv = /(^|\n)\.env(\b|\n)/.test(gitignore) || gitignore.includes('.env.*.local');
  const ignoresRaw = gitignore.includes('runs/**/raw/') || gitignore.includes('/raw/');
  checks.push({
    name: 'gitignore-covers-env',
    ok: ignoresEnv,
    detail: ignoresEnv ? '.env* is git-ignored' : '.env* NOT git-ignored - key could be committed',
    hard: true,
  });
  checks.push({
    name: 'gitignore-covers-raw',
    ok: ignoresRaw,
    detail: ignoresRaw ? 'raw artifact path is git-ignored' : 'raw artifact path NOT git-ignored',
    hard: true,
  });

  // 3. Model resolvable.
  const model = env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;
  checks.push({
    name: 'model-resolvable',
    ok: model.length > 0,
    detail: `evaluated model: ${model}`,
    hard: true,
  });

  // 4. Redaction self-test: the scrubber must catch a synthetic key.
  const synthetic = 'sk-ant-api03-THISisAsyntheticTESTkeyNOTreal000';
  const caught = scanForSecrets(`some text ${synthetic} more text`).length > 0;
  checks.push({
    name: 'scrubber-self-test',
    ok: caught,
    detail: caught ? 'scrubber catches synthetic sk-ant- keys' : 'scrubber FAILED to catch a synthetic key',
    hard: true,
  });

  // 5. Network reachability - documented manual step; not auto-attempted here
  // (never send the key just to probe). Recorded as informational.
  checks.push({
    name: 'network-reachability',
    ok: true,
    detail: 'manual: confirm https outbound to api.anthropic.com before running (not auto-probed to avoid sending the key)',
    hard: false,
  });

  return checks;
}

function readIfExists(p: string): string {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
}

function main() {
  const checks = runPreflight();
  let blocked = false;
  for (const c of checks) {
    const mark = c.ok ? '✓' : c.hard ? '✗' : '⚠';
    console.log(`${mark} ${c.name}: ${c.detail}`);
    if (!c.ok && c.hard) blocked = true;
  }
  if (blocked) {
    console.error('\nPreflight FAILED - resolve the ✗ items before running evaluation:live-anthropic.');
    process.exit(1);
  }
  console.log('\nPreflight OK - safe to run evaluation:live-anthropic.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
