import fs from 'fs';
import path from 'path';
import { runsDir, rawDir } from './paths';
import { scanForSecrets } from './scrub';

/**
 * A per-case raw artifact captured only in --retain-raw mode. "Raw" here means
 * the full structured request the harness built plus the full narration output
 * and usage - the material a human needs to debug a case. It deliberately does
 * NOT capture the literal HTTP bytes, because the Anthropic Authorization
 * header and api key live only in the transport layer (providers/claude/http.ts
 * never persists them); keeping capture at the harness level means a key
 * physically cannot enter an artifact. Every artifact is scrubbed before it is
 * written anyway (defense in depth).
 */
export interface RawCaseArtifact {
  caseId: string;
  provider: string; // 'live-anthropic' | 'mock' | 'crisis-gate'
  model?: string;
  promptVersionUsed?: string;
  request: {
    seed: string;
    spread: string;
    intake: unknown;
    questionText: string;
  };
  response: {
    providerUsed: string;
    fallbackReason?: string;
    output?: unknown; // the interpretation (narration) - present for non-crisis cases
    usage?: { inputTokens: number; outputTokens: number };
  };
  latencyMs: number;
}

export class RawArtifactSecretError extends Error {}

/**
 * Writes a raw artifact after scrubbing. If any secret-like content is found
 * (it should never be), it throws instead of writing - failing loud beats
 * persisting a key. `extraSecrets` carries the live env key value (never
 * logged) so an exact match is caught.
 */
export function writeRawArtifact(runId: string, artifact: RawCaseArtifact, extraSecrets: string[] = []): void {
  const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
  const findings = scanForSecrets(serialized, extraSecrets);
  if (findings.length > 0) {
    throw new RawArtifactSecretError(
      `refusing to write raw artifact for case ${artifact.caseId}: ${findings.length} secret-like match(es) found ` +
        `(${findings.map((f) => f.pattern).join(', ')}). This should never happen - investigate the capture path.`,
    );
  }
  const dir = rawDir(runId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${artifact.caseId}.json`), serialized, 'utf-8');
}

export function loadRawArtifacts(runId: string): RawCaseArtifact[] {
  const dir = rawDir(runId);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')) as RawCaseArtifact);
}

export interface CleanupResult {
  scanned: number;
  removed: string[];
}

/**
 * Deletes raw/ folders whose parent run is older than `maxAgeDays` (default 7,
 * Product Owner decision 3). Uses the run folder's own mtime; leaves the
 * scrubbed manifest/results in place - only the raw/ subfolder is removed.
 */
export function cleanupRaw(maxAgeDays = 7, now: number = Date.now()): CleanupResult {
  const base = runsDir();
  const removed: string[] = [];
  let scanned = 0;
  if (!fs.existsSync(base)) return { scanned, removed };

  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  for (const entry of fs.readdirSync(base)) {
    const raw = rawDir(entry);
    if (!fs.existsSync(raw)) continue;
    scanned += 1;
    const ageMs = now - fs.statSync(raw).mtimeMs;
    if (ageMs > maxAgeMs) {
      fs.rmSync(raw, { recursive: true, force: true });
      removed.push(entry);
    }
  }
  return { scanned, removed };
}
