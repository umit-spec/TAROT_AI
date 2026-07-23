import path from 'path';

export function evaluationDir(): string {
  return path.join(process.cwd(), 'data', 'evaluation');
}

export function casesPath(): string {
  return path.join(evaluationDir(), 'cases', 'cases.json');
}

export function runsDir(): string {
  return path.join(evaluationDir(), 'runs');
}

export function runDir(runId: string): string {
  return path.join(runsDir(), runId);
}

// Raw per-case artifacts (narration text + structured request) live here.
// Git-ignored, local-only, opt-in via --retain-raw, cleaned up after 7 days
// (Sprint S2, Product Owner decision 3). Never committed.
export function rawDir(runId: string): string {
  return path.join(runDir(runId), 'raw');
}

export function newRunId(prefix: string): string {
  return `${prefix}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
}
