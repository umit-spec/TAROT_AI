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

export function newRunId(prefix: string): string {
  return `${prefix}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
}
