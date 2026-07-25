import fs from 'fs';
import path from 'path';
import { EvaluationCaseSchema, type EvaluationCase } from '../../../src/types/evaluation';
import { casesPath } from './paths';

export class EvaluationIoError extends Error {}

export function loadCases(): EvaluationCase[] {
  const filePath = casesPath();
  if (!fs.existsSync(filePath)) {
    throw new EvaluationIoError(`Evaluation cases file not found: ${filePath}`);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    throw new EvaluationIoError(`${filePath} is not valid JSON: ${(err as Error).message}`);
  }
  if (!Array.isArray(raw)) {
    throw new EvaluationIoError(`${filePath} must contain a JSON array`);
  }
  return raw.map((entry, index) => {
    const result = EvaluationCaseSchema.safeParse(entry);
    if (!result.success) {
      const caseId = typeof entry === 'object' && entry && 'caseId' in entry ? String((entry as { caseId: unknown }).caseId) : `#${index}`;
      throw new EvaluationIoError(`Case ${caseId} failed validation: ${result.error.message}`);
    }
    return result.data;
  });
}

export function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}
