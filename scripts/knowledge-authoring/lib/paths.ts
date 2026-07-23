import path from 'path';
import type { RecordType } from '../../../src/types/knowledge-authoring';

// Functions, not module-load-time constants: each call reads
// process.cwd() fresh, so tests can chdir into a sandbox directory
// per-scenario. A real CLI invocation (one process per run) behaves
// identically either way.
export function authoringDir(): string {
  return path.join(process.cwd(), 'data', 'knowledge-authoring');
}
export function recordsDir(): string {
  return path.join(authoringDir(), 'records');
}
export function sourcesPath(): string {
  return path.join(authoringDir(), 'sources.json');
}
export function samplesDir(): string {
  return path.join(authoringDir(), 'samples');
}

// Human-Governed Methodology Extraction: draft/reviewed lessons live here,
// separate from `records/`. Lessons never hold source text - see
// docs/HUMAN_GOVERNED_METHODOLOGY_EXTRACTION_PROPOSAL_v1.0.md.
export function lessonsPath(): string {
  return path.join(authoringDir(), 'lessons', 'methodologyLessons.json');
}

// Pilot build output only. `build.ts` must never write outside this
// directory - promotion to the live bundle is promote.ts's job alone.
export function pilotBuildDir(): string {
  return path.join(process.cwd(), 'data', 'knowledge-builds', 'pilot');
}

// The only directory `promote.ts` is permitted to write to.
export function liveKnowledgeDir(): string {
  return path.join(process.cwd(), 'data', 'knowledge');
}

const RECORD_TYPE_FILES: Record<RecordType, string> = {
  pairRelation: 'pairRelations.json',
  positionRule: 'positionRules.json',
  domainModifier: 'domainModifiers.json',
  personaModifier: 'personaModifiers.json',
  safetyConstraint: 'safetyConstraints.json',
};

export function recordFilePath(recordType: RecordType): string {
  return path.join(recordsDir(), RECORD_TYPE_FILES[recordType]);
}

const RECORD_TYPE_CSV_FILES: Record<RecordType, string> = {
  pairRelation: 'pair_relations.csv',
  positionRule: 'position_rules.csv',
  domainModifier: 'domain_modifiers.csv',
  personaModifier: 'persona_modifiers.csv',
  safetyConstraint: 'safety_constraints.csv',
};

export function csvFileName(recordType: RecordType): string {
  return RECORD_TYPE_CSV_FILES[recordType];
}

export const ALL_RECORD_TYPES: RecordType[] = [
  'pairRelation',
  'positionRule',
  'domainModifier',
  'personaModifier',
  'safetyConstraint',
];
