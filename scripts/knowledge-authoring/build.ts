#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { KnowledgeBundleSchema, type KnowledgeBundle } from '../../src/types/knowledge';
import { BuildManifestSchema, type BuildManifest, type KnowledgeRecord } from '../../src/types/knowledge-authoring';
import { ALL_RECORD_TYPES, pilotBuildDir, liveKnowledgeDir } from './lib/paths';
import { loadRecords, loadSourceRegistry } from './lib/io';
import { detectConflicts } from './lib/conflicts';
import { sha256Of } from './lib/checksum';

// This script is only permitted to write under data/knowledge-builds/.
// Promotion to the live data/knowledge/ path is promote.ts's job alone -
// see Sprint 5 plan §2 rule 5. liveKnowledgeDir() is called here for
// exactly one read (the existing cards array, §build note below), never
// a write target.

export class BuildBlockedError extends Error {}

function collapseLockedRecords(records: KnowledgeRecord[]): { collapsed: KnowledgeRecord[]; conflictErrors: string[] } {
  const { errors, duplicates } = detectConflicts(records);
  if (errors.length > 0) {
    return { collapsed: [], conflictErrors: errors.map((e) => e.message) };
  }
  const duplicateRecordIdsToDrop = new Set(duplicates.flatMap((d) => d.recordIds.slice(1)));
  return { collapsed: records.filter((r) => !duplicateRecordIdsToDrop.has(r.recordId)), conflictErrors: [] };
}

function loadCardsFromLiveBundle(): unknown[] {
  // Sprint 5 does not introduce a card-authoring record type (out of
  // scope, §7) - card content is read, read-only, from the existing live
  // bundle so the pilot output can satisfy KnowledgeBundleSchema's
  // `cards` requirement without this pipeline ever writing to
  // data/knowledge/.
  const liveBundlePath = path.join(liveKnowledgeDir(), 'bundle-v0.1.0.json');
  const raw = JSON.parse(fs.readFileSync(liveBundlePath, 'utf-8'));
  return raw.cards;
}

export function build(knowledgeVersion: string): { bundle: KnowledgeBundle; manifest: BuildManifest } {
  const lockedByType: Record<string, KnowledgeRecord[]> = {};
  const allConflictErrors: string[] = [];

  for (const recordType of ALL_RECORD_TYPES) {
    const records = loadRecords(recordType).filter((r) => r.lifecycle.status === 'locked');
    const { collapsed, conflictErrors } = collapseLockedRecords(records);
    if (conflictErrors.length > 0) {
      allConflictErrors.push(...conflictErrors.map((m) => `[${recordType}] ${m}`));
      continue;
    }
    lockedByType[recordType] = collapsed;
  }

  if (allConflictErrors.length > 0) {
    throw new BuildBlockedError(
      `Build blocked - conflicting locked records:\n${allConflictErrors.map((m) => `  ${m}`).join('\n')}`,
    );
  }

  const registry = loadSourceRegistry();

  const bundle: KnowledgeBundle = {
    version: knowledgeVersion,
    cards: loadCardsFromLiveBundle() as KnowledgeBundle['cards'],
    pairRelations: lockedByType.pairRelation.map((r) => r.payload) as KnowledgeBundle['pairRelations'],
    positionRules: lockedByType.positionRule.map((r) => r.payload) as KnowledgeBundle['positionRules'],
    domainModifiers: lockedByType.domainModifier.map((r) => r.payload) as KnowledgeBundle['domainModifiers'],
    personaModifiers: lockedByType.personaModifier.map((r) => r.payload) as KnowledgeBundle['personaModifiers'],
    safetyConstraints: lockedByType.safetyConstraint.map((r) => r.payload) as KnowledgeBundle['safetyConstraints'],
  };

  const bundleResult = KnowledgeBundleSchema.safeParse(bundle);
  if (!bundleResult.success) {
    throw new BuildBlockedError(`Build output failed KnowledgeBundleSchema validation: ${bundleResult.error.message}`);
  }

  const lockedRecordCount = ALL_RECORD_TYPES.reduce((sum, t) => sum + lockedByType[t].length, 0);
  const manifest: BuildManifest = {
    knowledgeVersion,
    builtAt: new Date().toISOString(),
    recordCounts: {
      pairRelations: lockedByType.pairRelation.length,
      positionRules: lockedByType.positionRule.length,
      domainModifiers: lockedByType.domainModifier.length,
      personaModifiers: lockedByType.personaModifier.length,
      safetyConstraints: lockedByType.safetyConstraint.length,
    },
    sourceCount: registry.sources.length,
    lockedRecordCount,
    schemaVersion: '1.0.0',
    checksum: sha256Of(bundleResult.data),
  };

  const manifestResult = BuildManifestSchema.safeParse(manifest);
  if (!manifestResult.success) {
    throw new BuildBlockedError(`Manifest failed schema validation: ${manifestResult.error.message}`);
  }

  return { bundle: bundleResult.data, manifest: manifestResult.data };
}

function main() {
  const versionArgIdx = process.argv.indexOf('--version');
  const version = versionArgIdx >= 0 ? process.argv[versionArgIdx + 1] : '0.1.0';

  const { bundle, manifest } = build(version);

  const buildDir = pilotBuildDir();
  fs.mkdirSync(buildDir, { recursive: true });
  const bundlePath = path.join(buildDir, `knowledge-bundle.v${version}.json`);
  const manifestPath = path.join(buildDir, 'manifest.json');
  fs.writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');

  console.log(`Built pilot artifact: ${bundlePath}`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Locked records included: ${manifest.lockedRecordCount}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (err) {
    console.error(`knowledge-authoring:build failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
