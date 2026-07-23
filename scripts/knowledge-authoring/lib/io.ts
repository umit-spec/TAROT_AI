import fs from 'fs';
import {
  KnowledgeRecordSchema,
  SourceRegistrySchema,
  type KnowledgeRecord,
  type RecordType,
  type SourceRegistry,
} from '../../../src/types/knowledge-authoring';
import { recordFilePath, sourcesPath } from './paths';

export class AuthoringValidationError extends Error {}

function readJson(filePath: string): unknown {
  if (!fs.existsSync(filePath)) {
    throw new AuthoringValidationError(`Expected authoring file not found: ${filePath}`);
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    throw new AuthoringValidationError(`${filePath} is not valid JSON: ${(err as Error).message}`);
  }
}

export function loadSourceRegistry(): SourceRegistry {
  const raw = readJson(sourcesPath());
  const result = SourceRegistrySchema.safeParse(raw);
  if (!result.success) {
    throw new AuthoringValidationError(`sources.json failed schema validation: ${result.error.message}`);
  }
  return result.data;
}

/**
 * Loads and validates every record in a recordType's file. Throws with the
 * specific recordId and Zod message on the first invalid record - the
 * same "fail loud, name the record" bar as Sprint 3's bundle loader.
 */
export function loadRecords(recordType: RecordType): KnowledgeRecord[] {
  const filePath = recordFilePath(recordType);
  const raw = readJson(filePath);
  if (!Array.isArray(raw)) {
    throw new AuthoringValidationError(`${filePath} must contain a JSON array`);
  }
  return raw.map((entry, index) => {
    const result = KnowledgeRecordSchema.safeParse(entry);
    if (!result.success) {
      const recordId = typeof entry === 'object' && entry && 'recordId' in entry ? String(entry.recordId) : `#${index}`;
      throw new AuthoringValidationError(`${filePath} record ${recordId} failed validation: ${result.error.message}`);
    }
    return result.data;
  });
}

export function loadAllRecords(): Record<RecordType, KnowledgeRecord[]> {
  return {
    pairRelation: loadRecords('pairRelation'),
    positionRule: loadRecords('positionRule'),
    domainModifier: loadRecords('domainModifier'),
    personaModifier: loadRecords('personaModifier'),
    safetyConstraint: loadRecords('safetyConstraint'),
  };
}

export function saveRecords(recordType: RecordType, records: KnowledgeRecord[]): void {
  const filePath = recordFilePath(recordType);
  const validated = records.map((r) => {
    const result = KnowledgeRecordSchema.safeParse(r);
    if (!result.success) {
      throw new AuthoringValidationError(`refusing to save invalid record ${r.recordId}: ${result.error.message}`);
    }
    return result.data;
  });
  fs.writeFileSync(filePath, `${JSON.stringify(validated, null, 2)}\n`, 'utf-8');
}
