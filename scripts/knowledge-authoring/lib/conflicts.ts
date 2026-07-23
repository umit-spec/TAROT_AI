import type { KnowledgeRecord } from '../../../src/types/knowledge-authoring';

export interface ConflictEntry {
  key: string;
  recordIds: string[];
  message: string;
}

export interface DuplicateEntry {
  key: string;
  recordIds: string[];
}

export interface ConflictReport {
  warnings: ConflictEntry[]; // among draft/reviewed/red-teamed records - competing drafts are allowed
  errors: ConflictEntry[]; // among locked records - two contradictory locked truths must never both ship
  duplicates: DuplicateEntry[]; // among locked records - identical content, collapses to one, just logged
}

/**
 * Duplicate key per recordType, per Sprint 5 plan §5. Not the recordId -
 * the semantic identity a second, later-authored record could collide
 * with (e.g. two pairRelation records both describing 00-fool -> 01-magician).
 */
function keyOf(record: KnowledgeRecord): string {
  switch (record.recordType) {
    case 'pairRelation':
      return `${record.payload.previousCardId}::${record.payload.focusCardId}`;
    case 'positionRule':
      return `${record.payload.position}::${record.payload.spread}`;
    case 'domainModifier':
      return record.payload.domain;
    case 'personaModifier':
      return record.payload.persona;
    case 'safetyConstraint':
      return record.payload.flag;
  }
}

/** The content fields that make two same-key records the same claim or a conflicting one. */
function fingerprintOf(record: KnowledgeRecord): string {
  switch (record.recordType) {
    case 'pairRelation':
      return JSON.stringify({ relationType: record.payload.relationType, semanticEffect: record.payload.semanticEffect });
    case 'positionRule':
      return JSON.stringify({ emphasis: record.payload.emphasis, framingGuidance: record.payload.framingGuidance });
    case 'domainModifier':
      return JSON.stringify({ emphasisKeywords: record.payload.emphasisKeywords, cautionNotes: record.payload.cautionNotes });
    case 'personaModifier':
      return JSON.stringify({ toneGuidance: record.payload.toneGuidance, depthGuidance: record.payload.depthGuidance });
    case 'safetyConstraint':
      return JSON.stringify({ action: record.payload.action, disclaimerText: record.payload.disclaimerText });
  }
}

function groupByKey(records: KnowledgeRecord[]): Map<string, KnowledgeRecord[]> {
  const groups = new Map<string, KnowledgeRecord[]>();
  for (const record of records) {
    const key = keyOf(record);
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }
  return groups;
}

function evaluateGroup(group: KnowledgeRecord[]): 'conflict' | 'duplicate' | 'ok' {
  if (group.length < 2) return 'ok';
  const fingerprints = new Set(group.map(fingerprintOf));
  return fingerprints.size > 1 ? 'conflict' : 'duplicate';
}

export function detectConflicts(records: KnowledgeRecord[]): ConflictReport {
  const locked = records.filter((r) => r.lifecycle.status === 'locked');
  const nonLocked = records.filter((r) => r.lifecycle.status !== 'locked');

  const warnings: ConflictEntry[] = [];
  for (const [key, group] of groupByKey(nonLocked)) {
    if (evaluateGroup(group) === 'conflict') {
      warnings.push({
        key,
        recordIds: group.map((r) => r.recordId),
        message: `Competing drafts for key "${key}": ${group.map((r) => r.recordId).join(', ')}`,
      });
    }
  }

  const errors: ConflictEntry[] = [];
  const duplicates: DuplicateEntry[] = [];
  for (const [key, group] of groupByKey(locked)) {
    const verdict = evaluateGroup(group);
    if (verdict === 'conflict') {
      errors.push({
        key,
        recordIds: group.map((r) => r.recordId),
        message: `Locked records conflict for key "${key}": ${group.map((r) => r.recordId).join(', ')} disagree`,
      });
    } else if (verdict === 'duplicate') {
      duplicates.push({ key, recordIds: group.map((r) => r.recordId) });
    }
  }

  return { warnings, errors, duplicates };
}
