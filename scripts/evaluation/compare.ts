#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { evaluationDir } from './lib/paths';
import { loadRawArtifacts, type RawCaseArtifact } from './lib/raw';

/**
 * Claude-vs-Mock BLIND comparison tooling (Sprint S2, Product Owner decision).
 * `build` reads the --retain-raw artifacts of a live run and a mock run over
 * the same cases, strips provider identity, randomizes A/B order per case, and
 * writes a scoring sheet plus a SEPARATE unblind map. A human scores the sheet
 * without knowing which option is Claude; `unblind` then joins the scores back
 * to providers and reports the delta - the exact question G1 needs.
 */

function comparisonsDir(): string {
  return path.join(evaluationDir(), 'comparisons');
}

interface BlindPair {
  pairId: string;
  caseId: string;
  optionA: string; // serialized narration output, provider-identity stripped
  optionB: string;
}

interface UnblindEntry {
  pairId: string;
  caseId: string;
  A: string; // provider label
  B: string;
}

function narrationOf(a: RawCaseArtifact): string | null {
  if (!a.response.output) return null; // crisis-gate / no narration
  return JSON.stringify(a.response.output, null, 2);
}

export function build(liveRunId: string, mockRunId: string): { dir: string; pairCount: number } {
  const live = new Map(loadRawArtifacts(liveRunId).map((a) => [a.caseId, a]));
  const mock = new Map(loadRawArtifacts(mockRunId).map((a) => [a.caseId, a]));
  if (live.size === 0) throw new Error(`no raw artifacts for live run ${liveRunId} - run with --retain-raw`);
  if (mock.size === 0) throw new Error(`no raw artifacts for mock run ${mockRunId} - run with --retain-raw`);

  const sheet: BlindPair[] = [];
  const map: UnblindEntry[] = [];

  for (const [caseId, liveArt] of live) {
    const mockArt = mock.get(caseId);
    if (!mockArt) continue;
    const liveText = narrationOf(liveArt);
    const mockText = narrationOf(mockArt);
    if (!liveText || !mockText) continue; // skip crisis / missing narration

    const pairId = `pair-${caseId}`;
    const liveIsA = Math.random() < 0.5; // blind randomization per case
    sheet.push({
      pairId,
      caseId,
      optionA: liveIsA ? liveText : mockText,
      optionB: liveIsA ? mockText : liveText,
    });
    map.push({
      pairId,
      caseId,
      A: liveIsA ? 'live-anthropic' : 'mock',
      B: liveIsA ? 'mock' : 'live-anthropic',
    });
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.join(comparisonsDir(), stamp);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'scoring-sheet.json'), `${JSON.stringify(sheet, null, 2)}\n`);
  fs.writeFileSync(path.join(dir, 'unblind-map.json'), `${JSON.stringify(map, null, 2)}\n`);
  // A blank scores template the human fills in (preferred: 'A' | 'B' | 'tie').
  const template = sheet.map((p) => ({ pairId: p.pairId, preferred: '', notes: '' }));
  fs.writeFileSync(path.join(dir, 'scores.template.json'), `${JSON.stringify(template, null, 2)}\n`);
  return { dir, pairCount: sheet.length };
}

interface Score {
  pairId: string;
  preferred: 'A' | 'B' | 'tie' | '';
}

export function unblind(
  comparisonDir: string,
  scores: Score[],
): { liveWins: number; mockWins: number; ties: number; unscored: number; total: number } {
  const map: UnblindEntry[] = JSON.parse(fs.readFileSync(path.join(comparisonDir, 'unblind-map.json'), 'utf-8'));
  const byPair = new Map(map.map((m) => [m.pairId, m]));

  let liveWins = 0;
  let mockWins = 0;
  let ties = 0;
  let unscored = 0;
  for (const s of scores) {
    const entry = byPair.get(s.pairId);
    if (!entry) continue;
    if (s.preferred === 'tie') ties += 1;
    else if (s.preferred === 'A') (entry.A === 'live-anthropic' ? liveWins++ : mockWins++);
    else if (s.preferred === 'B') (entry.B === 'live-anthropic' ? liveWins++ : mockWins++);
    else unscored += 1;
  }
  return { liveWins, mockWins, ties, unscored, total: map.length };
}

function main() {
  const [cmd, a, b] = process.argv.slice(2);
  if (cmd === 'build') {
    if (!a || !b) throw new Error('Usage: compare.ts build <liveRunId> <mockRunId>');
    const { dir, pairCount } = build(a, b);
    console.log(`Blind comparison built: ${path.relative(process.cwd(), dir)} (${pairCount} pairs)`);
    console.log('Score scores.template.json (preferred: A|B|tie) WITHOUT reading unblind-map.json, then run:');
    console.log(`  npm run evaluation:compare -- unblind ${path.relative(process.cwd(), dir)} <your-scores.json>`);
  } else if (cmd === 'unblind') {
    if (!a || !b) throw new Error('Usage: compare.ts unblind <comparisonDir> <scoresFile>');
    const scores: Score[] = JSON.parse(fs.readFileSync(b, 'utf-8'));
    const r = unblind(a, scores);
    console.log(`Blind comparison result (${r.total} pairs):`);
    console.log(`  live-anthropic preferred: ${r.liveWins}`);
    console.log(`  mock preferred:           ${r.mockWins}`);
    console.log(`  ties:                     ${r.ties}`);
    console.log(`  unscored:                 ${r.unscored}`);
    console.log(
      r.liveWins > r.mockWins
        ? '  → live model preferred over the deterministic Mock (record magnitude + scorer in the evidence report)'
        : '  → live model did NOT beat the deterministic Mock - a G1 STOP/NARROW signal (verify with more scorers)',
    );
  } else {
    throw new Error('Usage: compare.ts <build|unblind> ...');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (err) {
    console.error(`evaluation:compare failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
