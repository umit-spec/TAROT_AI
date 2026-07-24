#!/usr/bin/env tsx
import { ALL_RECORD_TYPES } from './lib/paths';
import { loadAllRecords, loadSourceRegistry } from './lib/io';
import type { KnowledgeRecord } from '../../src/types/knowledge-authoring';

export interface ValidationResult {
  orphanCitations: { recordId: string; sourceRef: string }[];
  governanceWarnings: string[];
}

/**
 * Schema-level checks (lifecycle gates, AI-verification gating, locked
 * records need sourceRefs) already ran inside loadAllRecords/loadRecords,
 * via KnowledgeRecordSchema.safeParse - a record that fails those never
 * makes it into the arrays this function receives. This function checks
 * the two things that need cross-file context: citation integrity
 * against the source registry, and the single-operator governance
 * warning, which is deliberately non-blocking (see Sprint 5 plan §1.2).
 */
export function validateAuthoringStore(
  allRecords: Record<string, KnowledgeRecord[]>,
  sourceIds: Set<string>,
): ValidationResult {
  const orphanCitations: { recordId: string; sourceRef: string }[] = [];
  const governanceWarnings: string[] = [];

  for (const records of Object.values(allRecords)) {
    for (const record of records) {
      for (const ref of record.sourceRefs) {
        if (!sourceIds.has(ref)) {
          orphanCitations.push({ recordId: record.recordId, sourceRef: ref });
        }
      }
      const { lifecycle } = record;
      if (lifecycle.singleOperatorMode && lifecycle.reviewerId && lifecycle.authorId === lifecycle.reviewerId) {
        governanceWarnings.push(
          `[governance warning] record "${record.recordId}": authorId === reviewerId ("${lifecycle.authorId}") under singleOperatorMode - acceptable for pilot only, not for production knowledge sets`,
        );
      }
    }
  }

  return { orphanCitations, governanceWarnings };
}

function main() {
  const allRecords = loadAllRecords();
  const registry = loadSourceRegistry();
  const sourceIds = new Set(registry.sources.map((s) => s.sourceId));

  const { orphanCitations, governanceWarnings } = validateAuthoringStore(allRecords, sourceIds);

  for (const warning of governanceWarnings) {
    console.warn(warning);
  }

  // Related-source integrity + duplicate-lineage surfacing: every
  // governance.relatedSources reference must resolve, and a duplicate/related
  // edition is printed as a standing warning so evidence accounting never
  // double-counts one lineage family as two independent sources.
  const relatedOrphans: { sourceId: string; ref: string }[] = [];
  for (const s of registry.sources) {
    for (const rel of s.governance?.relatedSources ?? []) {
      if (!sourceIds.has(rel.sourceId)) {
        relatedOrphans.push({ sourceId: s.sourceId, ref: rel.sourceId });
      }
      if (rel.deduplicationRequired) {
        console.warn(
          `[lineage warning] source "${s.sourceId}" is a ${rel.relationshipType} of "${rel.sourceId}" ` +
            `(${rel.contentOverlapStatus}) - do NOT count them as two independent corroborating sources.`,
        );
      }
    }
  }
  if (relatedOrphans.length > 0) {
    console.error('Related-source integrity failures:');
    for (const { sourceId, ref } of relatedOrphans) {
      console.error(`  source "${sourceId}" references unresolvable relatedSource "${ref}"`);
    }
    process.exitCode = 1;
    return;
  }

  const totalRecords = Object.values(allRecords).reduce((sum, r) => sum + r.length, 0);
  console.log(`Validated ${totalRecords} records against ${ALL_RECORD_TYPES.length} record types and ${sourceIds.size} sources.`);

  if (orphanCitations.length > 0) {
    console.error('Citation integrity failures:');
    for (const { recordId, sourceRef } of orphanCitations) {
      console.error(`  record "${recordId}" cites unresolvable sourceRef "${sourceRef}"`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('OK: all citations resolve, no schema violations.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (err) {
    console.error(`knowledge-authoring:validate failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
