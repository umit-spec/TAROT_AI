#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { runDir } from './lib/paths';
import { scanForSecrets } from './lib/scrub';

/**
 * Scans every file in a run folder (including raw/) for secret-like content
 * before anything is shown or committed (Sprint S2, decision 3). Fails loud if
 * anything is found. Optionally pass the live env key so an exact match is
 * caught; the key is read from process.env here and never printed.
 */
export function scrubRunFolder(runId: string): { scanned: number; findings: { file: string; pattern: string; masked: string }[] } {
  const dir = runDir(runId);
  if (!fs.existsSync(dir)) {
    throw new Error(`run folder not found: ${dir}`);
  }
  const extraSecrets = process.env.ANTHROPIC_API_KEY ? [process.env.ANTHROPIC_API_KEY] : [];
  const findings: { file: string; pattern: string; masked: string }[] = [];
  let scanned = 0;

  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        scanned += 1;
        const text = fs.readFileSync(full, 'utf-8');
        for (const f of scanForSecrets(text, extraSecrets)) {
          findings.push({ file: path.relative(process.cwd(), full), pattern: f.pattern, masked: f.masked });
        }
      }
    }
  };
  walk(dir);
  return { scanned, findings };
}

function main() {
  const runId = process.argv[2];
  if (!runId) throw new Error('Usage: scrub-artifacts.ts <runId>');
  const { scanned, findings } = scrubRunFolder(runId);
  console.log(`Scanned ${scanned} file(s) in run ${runId}.`);
  if (findings.length > 0) {
    console.error(`SECRET-LIKE CONTENT FOUND (${findings.length}) - do NOT commit this run:`);
    for (const f of findings) console.error(`  ${f.file}: [${f.pattern}] ${f.masked}`);
    process.exit(1);
  }
  console.log('OK: no secret-like content found. Derived metrics are safe to commit; raw/ stays local.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (err) {
    console.error(`evaluation:scrub-artifacts failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
