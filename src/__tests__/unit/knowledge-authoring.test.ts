import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  KnowledgeRecordSchema,
  SourceRightsSchema,
  SourceSchema,
  type KnowledgeRecord,
  type Lifecycle,
} from '../../types/knowledge-authoring';
import { detectConflicts } from '../../../scripts/knowledge-authoring/lib/conflicts';
import { parseCsvToObjects, csvRowToRawRecord } from '../../../scripts/knowledge-authoring/lib/csv';
import { sha256Of } from '../../../scripts/knowledge-authoring/lib/checksum';

const baseLifecycle = (overrides: Partial<Lifecycle> = {}): Lifecycle => ({
  status: 'draft',
  authorId: 'umit',
  draftOrigin: 'human',
  singleOperatorMode: false,
  ...overrides,
});

const basePairRecord = (overrides: {
  recordId?: string;
  sourceRefs?: string[];
  sourceVerifications?: KnowledgeRecord['sourceVerifications'];
  lifecycle?: Partial<Lifecycle>;
  relationType?: string;
}): unknown => ({
  recordId: overrides.recordId ?? 'pair-00-fool-01-magician',
  recordType: 'pairRelation',
  sourceRefs: overrides.sourceRefs ?? [],
  sourceVerifications: overrides.sourceVerifications ?? [],
  lifecycle: baseLifecycle(overrides.lifecycle),
  createdAt: '2026-07-01T09:00:00Z',
  updatedAt: '2026-07-01T09:00:00Z',
  payload: {
    previousCardId: '00-fool',
    focusCardId: '01-magician',
    relationType: overrides.relationType ?? 'reinforces',
    semanticEffect: ['test effect'],
    warnings: [],
    sourceRefs: [],
  },
});

describe('KnowledgeRecordSchema - lifecycle governance (Sprint 5 test matrix #1-5)', () => {
  test('#1 accepts a valid draft record with draftOrigin ai-assisted + aiTool notebooklm', () => {
    const record = basePairRecord({ lifecycle: { draftOrigin: 'ai-assisted', aiTool: 'notebooklm' } });
    expect(KnowledgeRecordSchema.safeParse(record).success).toBe(true);
  });

  test('#2 rejects status "reviewed" with no reviewerId', () => {
    const record = basePairRecord({ lifecycle: { status: 'reviewed', reviewedAt: '2026-07-02T09:00:00Z' } });
    expect(KnowledgeRecordSchema.safeParse(record).success).toBe(false);
  });

  test('#3 rejects status "locked" with lockAuthorityId "claude" - the literal governance rule this sprint exists for', () => {
    const record = basePairRecord({
      sourceRefs: ['some-source'],
      lifecycle: {
        status: 'locked',
        reviewerId: 'umit',
        reviewedAt: '2026-07-02T09:00:00Z',
        redTeamActorId: 'claude',
        redTeamedAt: '2026-07-03T09:00:00Z',
        lockAuthorityId: 'claude',
        lockedAt: '2026-07-04T09:00:00Z',
      },
    });
    const result = KnowledgeRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
  });

  test('#3b accepts status "red-teamed" with redTeamActorId "claude" - Claude is a sanctioned Red Team actor', () => {
    const record = basePairRecord({
      lifecycle: {
        status: 'red-teamed',
        reviewerId: 'umit',
        reviewedAt: '2026-07-02T09:00:00Z',
        redTeamActorId: 'claude',
        redTeamedAt: '2026-07-03T09:00:00Z',
      },
    });
    expect(KnowledgeRecordSchema.safeParse(record).success).toBe(true);
  });

  test('#3c rejects an ai-assisted record reaching red-teamed with an unverified sourceRef', () => {
    const record = basePairRecord({
      sourceRefs: ['notebooklm-major-arcana-research-2026-07'],
      sourceVerifications: [],
      lifecycle: {
        status: 'red-teamed',
        draftOrigin: 'ai-assisted',
        aiTool: 'notebooklm',
        reviewerId: 'umit',
        reviewedAt: '2026-07-02T09:00:00Z',
        redTeamActorId: 'claude',
        redTeamedAt: '2026-07-03T09:00:00Z',
      },
    });
    expect(KnowledgeRecordSchema.safeParse(record).success).toBe(false);
  });

  test('#3c (positive) accepts the same record once its source is individually verified', () => {
    const record = basePairRecord({
      sourceRefs: ['notebooklm-major-arcana-research-2026-07'],
      sourceVerifications: [
        { sourceId: 'notebooklm-major-arcana-research-2026-07', verifiedBy: 'umit', verifiedAt: '2026-07-02T12:00:00Z' },
      ],
      lifecycle: {
        status: 'red-teamed',
        draftOrigin: 'ai-assisted',
        aiTool: 'notebooklm',
        reviewerId: 'umit',
        reviewedAt: '2026-07-02T09:00:00Z',
        redTeamActorId: 'claude',
        redTeamedAt: '2026-07-03T09:00:00Z',
      },
    });
    expect(KnowledgeRecordSchema.safeParse(record).success).toBe(true);
  });

  test('#4 rejects status "locked" with sourceRefs: []', () => {
    const record = basePairRecord({
      sourceRefs: [],
      lifecycle: {
        status: 'locked',
        reviewerId: 'umit',
        reviewedAt: '2026-07-02T09:00:00Z',
        redTeamActorId: 'umit',
        redTeamedAt: '2026-07-03T09:00:00Z',
        lockAuthorityId: 'umit',
        lockedAt: '2026-07-04T09:00:00Z',
      },
    });
    expect(KnowledgeRecordSchema.safeParse(record).success).toBe(false);
  });

  test('#5 accepts status "locked" with reviewerId/redTeamActorId/lockAuthorityId all named humans and non-empty sourceRefs', () => {
    const record = basePairRecord({
      sourceRefs: ['tarot-ai-original-synthesis-v1'],
      lifecycle: {
        status: 'locked',
        reviewerId: 'umit',
        reviewedAt: '2026-07-02T09:00:00Z',
        redTeamActorId: 'claude',
        redTeamedAt: '2026-07-03T09:00:00Z',
        lockAuthorityId: 'umit',
        lockedAt: '2026-07-04T09:00:00Z',
      },
    });
    expect(KnowledgeRecordSchema.safeParse(record).success).toBe(true);
  });

  test('reviewerId set to an AI actor id is rejected even at reviewed status', () => {
    const record = basePairRecord({ lifecycle: { status: 'reviewed', reviewerId: 'notebooklm', reviewedAt: '2026-07-02T09:00:00Z' } });
    expect(KnowledgeRecordSchema.safeParse(record).success).toBe(false);
  });
});

describe('Source rights metadata (lineage-only source registration)', () => {
  test('rights block is optional - existing sources without it still validate', () => {
    expect(SourceSchema.safeParse({ sourceId: 's', title: 't', type: 'classic-text' }).success).toBe(true);
  });

  test('a lineage-only rights block validates and defaults to no retrieval storage', () => {
    const rights = {
      rightsHolder: 'The Bill Store',
      permissionStatus: 'unverified' as const,
      permissionEvidence: null,
      usageScope: 'abstract-principle-lineage-only',
      allowsRetrievalStorage: false,
    };
    expect(SourceRightsSchema.safeParse(rights).success).toBe(true);
    expect(
      SourceSchema.safeParse({ sourceId: 'baslangic-tarot-rehberi-2025', title: 'x', type: 'classic-text', rights })
        .success,
    ).toBe(true);
  });
});

describe('check-conflicts (Sprint 5 test matrix #7-9)', () => {
  test('#7 reports a warning for two conflicting draft records, not an error', () => {
    const a = KnowledgeRecordSchema.parse(basePairRecord({ recordId: 'pair-a', relationType: 'reinforces' }));
    const b = KnowledgeRecordSchema.parse(basePairRecord({ recordId: 'pair-b', relationType: 'blocks' }));
    const report = detectConflicts([a, b]);
    expect(report.warnings).toHaveLength(1);
    expect(report.errors).toHaveLength(0);
  });

  test('#8 reports a build-blocking error for two conflicting locked records', () => {
    const lockedLifecycle: Partial<Lifecycle> = {
      status: 'locked',
      reviewerId: 'umit',
      reviewedAt: '2026-07-02T09:00:00Z',
      redTeamActorId: 'umit',
      redTeamedAt: '2026-07-03T09:00:00Z',
      lockAuthorityId: 'umit',
      lockedAt: '2026-07-04T09:00:00Z',
    };
    const a = KnowledgeRecordSchema.parse(
      basePairRecord({ recordId: 'pair-a', relationType: 'reinforces', sourceRefs: ['s'], lifecycle: lockedLifecycle }),
    );
    const b = KnowledgeRecordSchema.parse(
      basePairRecord({ recordId: 'pair-b', relationType: 'blocks', sourceRefs: ['s'], lifecycle: lockedLifecycle }),
    );
    const report = detectConflicts([a, b]);
    expect(report.errors).toHaveLength(1);
    expect(report.errors[0].recordIds.sort()).toEqual(['pair-a', 'pair-b']);
  });

  test('#9 collapses two identical locked duplicates without erroring', () => {
    const lockedLifecycle: Partial<Lifecycle> = {
      status: 'locked',
      reviewerId: 'umit',
      reviewedAt: '2026-07-02T09:00:00Z',
      redTeamActorId: 'umit',
      redTeamedAt: '2026-07-03T09:00:00Z',
      lockAuthorityId: 'umit',
      lockedAt: '2026-07-04T09:00:00Z',
    };
    const a = KnowledgeRecordSchema.parse(
      basePairRecord({ recordId: 'pair-a', relationType: 'reinforces', sourceRefs: ['s'], lifecycle: lockedLifecycle }),
    );
    const b = KnowledgeRecordSchema.parse(
      basePairRecord({ recordId: 'pair-b', relationType: 'reinforces', sourceRefs: ['s'], lifecycle: lockedLifecycle }),
    );
    const report = detectConflicts([a, b]);
    expect(report.errors).toHaveLength(0);
    expect(report.duplicates).toHaveLength(1);
  });
});

describe('CSV ingestion (Sprint 5 test matrix #12)', () => {
  test('#12 sample CSV produces a KnowledgeRecordSchema-valid draft record', () => {
    const samplePath = path.join(process.cwd(), 'data/knowledge-authoring/samples/pair_relations.sample.csv');
    const content = fs.readFileSync(samplePath, 'utf-8');
    const rows = parseCsvToObjects(content);
    expect(rows.length).toBeGreaterThan(0);
    const raw = csvRowToRawRecord('pairRelation', rows[0]);
    const result = KnowledgeRecordSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.lifecycle.status).toBe('draft');
  });

  test('list-valued cells preserve a comma embedded inside a single list item', () => {
    const content = [
      'record_id,status,previous_card_id,focus_card_id,relation_type,semantic_effects,warnings,source_refs,source_verifications,author_id,reviewer_id,red_team_actor_id,lock_authority_id,draft_origin,ai_tool,created_at,reviewed_at,red_teamed_at,locked_at,notes',
      'pair-x,draft,00-fool,01-magician,reinforces,"[""a comma, inside one effect""]","[]",[],[],umit,,,,human,,2026-07-23T09:00:00Z,,,,',
    ].join('\n');
    const rows = parseCsvToObjects(content);
    const raw = csvRowToRawRecord('pairRelation', rows[0]) as { payload: { semanticEffect: string[] } };
    expect(raw.payload.semanticEffect).toEqual(['a comma, inside one effect']);
  });
});

describe('Structural boundary: scripts/knowledge-authoring/** is never imported by runtime code (test matrix #15)', () => {
  const runtimeDirs = ['src/app', 'src/server/reading-engine', 'src/server/knowledge'];

  function allFiles(dir: string): string[] {
    const abs = path.join(process.cwd(), dir);
    if (!fs.existsSync(abs)) return [];
    return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return allFiles(entryPath);
      return entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') ? [entryPath] : [];
    });
  }

  test('no runtime file imports scripts/knowledge-authoring', () => {
    for (const dir of runtimeDirs) {
      for (const file of allFiles(dir)) {
        const source = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
        expect(source, `${file} must not import scripts/knowledge-authoring`).not.toMatch(/scripts\/knowledge-authoring/);
      }
    }
  });

  test('bundle.ts and local-json-provider.ts still define BUNDLE_PATH / resolveContext unchanged in shape', () => {
    const bundleSource = fs.readFileSync(path.join(process.cwd(), 'src/server/knowledge/bundle.ts'), 'utf-8');
    expect(bundleSource).toMatch(/bundle-v0\.1\.0\.json/);
    const providerSource = fs.readFileSync(path.join(process.cwd(), 'src/server/knowledge/local-json-provider.ts'), 'utf-8');
    expect(providerSource).toMatch(/resolveContext/);
  });
});

describe('Structural boundary: build/promote write-path separation (test matrix #20)', () => {
  test('only promote.ts writes under data/knowledge/; build.ts never references that path as a write target', () => {
    const buildSource = fs.readFileSync(path.join(process.cwd(), 'scripts/knowledge-authoring/build.ts'), 'utf-8');
    // build.ts may READ the live bundle (for cards) but must never call a
    // write function (writeFileSync/mkdirSync/renameSync) against liveKnowledgeDir().
    const writeCalls = ['writeFileSync', 'mkdirSync', 'renameSync', 'copyFileSync'];
    const liveDirUsageLines = buildSource.split('\n').filter((line) => line.includes('liveKnowledgeDir()'));
    for (const line of liveDirUsageLines) {
      for (const call of writeCalls) {
        expect(line, `build.ts line "${line}" must not write via liveKnowledgeDir()`).not.toContain(call);
      }
    }

    const otherFiles = fs
      .readdirSync(path.join(process.cwd(), 'scripts/knowledge-authoring'), { recursive: true } as never)
      .filter((f): f is string => typeof f === 'string' && f.endsWith('.ts') && !f.includes('promote.ts'));
    for (const file of otherFiles) {
      const source = fs.readFileSync(path.join(process.cwd(), 'scripts/knowledge-authoring', file), 'utf-8');
      expect(source, `${file} must not import liveKnowledgeDir for writing`).not.toMatch(/liveKnowledgeDir.*writeFileSync|writeFileSync.*liveKnowledgeDir/);
    }
  });
});

describe('Manifest checksum is independently recomputable (test matrix #19)', () => {
  test('sha256Of is deterministic regardless of key order', () => {
    const a = { b: 2, a: 1, nested: { z: 1, y: 2 } };
    const b = { a: 1, b: 2, nested: { y: 2, z: 1 } };
    expect(sha256Of(a)).toBe(sha256Of(b));
  });

  test('sha256Of changes when content changes', () => {
    expect(sha256Of({ a: 1 })).not.toBe(sha256Of({ a: 2 }));
  });
});

describe('Sandbox-backed pipeline integration (build/promote/ingest, test matrix #10, #11, #14, #17, #18, #21, #22)', () => {
  let sandboxDir: string;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    sandboxDir = fs.mkdtempSync(path.join(os.tmpdir(), 'knowledge-authoring-sandbox-'));
    fs.mkdirSync(path.join(sandboxDir, 'data/knowledge-authoring/records'), { recursive: true });
    fs.mkdirSync(path.join(sandboxDir, 'data/knowledge'), { recursive: true });

    fs.copyFileSync(
      path.join(originalCwd, 'data/knowledge-authoring/sources.json'),
      path.join(sandboxDir, 'data/knowledge-authoring/sources.json'),
    );
    fs.copyFileSync(
      path.join(originalCwd, 'data/knowledge/bundle-v0.1.0.json'),
      path.join(sandboxDir, 'data/knowledge/bundle-v0.1.0.json'),
    );
    for (const file of ['positionRules.json', 'domainModifiers.json', 'personaModifiers.json', 'safetyConstraints.json']) {
      fs.writeFileSync(path.join(sandboxDir, 'data/knowledge-authoring/records', file), '[]\n');
    }
    fs.writeFileSync(path.join(sandboxDir, 'data/knowledge-authoring/records/pairRelations.json'), '[]\n');

    process.chdir(sandboxDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(sandboxDir, { recursive: true, force: true });
  });

  test('#10/#11 build.ts excludes a reviewed-but-not-red-teamed record and output passes KnowledgeBundleSchema', async () => {
    const { saveRecords } = await import('../../../scripts/knowledge-authoring/lib/io');
    const reviewedOnly = KnowledgeRecordSchema.parse(
      basePairRecord({
        recordId: 'pair-reviewed-only',
        sourceRefs: ['tarot-ai-original-synthesis-v1'],
        lifecycle: { status: 'reviewed', reviewerId: 'umit', reviewedAt: '2026-07-02T09:00:00Z' },
      }),
    );
    const locked = KnowledgeRecordSchema.parse(
      basePairRecord({
        recordId: 'pair-locked',
        sourceRefs: ['tarot-ai-original-synthesis-v1'],
        lifecycle: {
          status: 'locked',
          reviewerId: 'umit',
          reviewedAt: '2026-07-02T09:00:00Z',
          redTeamActorId: 'claude',
          redTeamedAt: '2026-07-03T09:00:00Z',
          lockAuthorityId: 'umit',
          lockedAt: '2026-07-04T09:00:00Z',
        },
      }),
    );
    saveRecords('pairRelation', [reviewedOnly, locked]);

    const { build } = await import('../../../scripts/knowledge-authoring/build');
    const { bundle, manifest } = build('0.1.0-test');

    expect(bundle.pairRelations).toHaveLength(1);
    expect(manifest.lockedRecordCount).toBe(1);
    const { KnowledgeBundleSchema } = await import('../../types/knowledge');
    expect(KnowledgeBundleSchema.safeParse(bundle).success).toBe(true);
  });

  test('#14 ingest.ts refuses a payload change to an already-locked record without explicit status demotion', async () => {
    const { saveRecords } = await import('../../../scripts/knowledge-authoring/lib/io');
    const locked = KnowledgeRecordSchema.parse(
      basePairRecord({
        recordId: 'pair-locked',
        sourceRefs: ['tarot-ai-original-synthesis-v1'],
        lifecycle: {
          status: 'locked',
          reviewerId: 'umit',
          reviewedAt: '2026-07-02T09:00:00Z',
          redTeamActorId: 'claude',
          redTeamedAt: '2026-07-03T09:00:00Z',
          lockAuthorityId: 'umit',
          lockedAt: '2026-07-04T09:00:00Z',
        },
      }),
    );
    saveRecords('pairRelation', [locked]);

    const jsonPath = path.join(sandboxDir, 'edit-attempt.json');
    fs.writeFileSync(
      jsonPath,
      JSON.stringify([basePairRecord({ recordId: 'pair-locked', relationType: 'blocks' })]),
    );

    const { ingest } = await import('../../../scripts/knowledge-authoring/ingest');
    expect(() => ingest('pairRelation', jsonPath)).toThrow(/locked/);
  });

  test('#17/#18 end-to-end: locked pilot-style record builds, and singleOperatorMode warning is non-blocking', async () => {
    const { saveRecords } = await import('../../../scripts/knowledge-authoring/lib/io');
    const record = KnowledgeRecordSchema.parse(
      basePairRecord({
        recordId: 'pair-e2e',
        sourceRefs: ['tarot-ai-original-synthesis-v1'],
        lifecycle: {
          status: 'locked',
          reviewerId: 'umit', // same as authorId - single-operator pilot pattern
          reviewedAt: '2026-07-02T09:00:00Z',
          redTeamActorId: 'claude',
          redTeamedAt: '2026-07-03T09:00:00Z',
          lockAuthorityId: 'umit',
          lockedAt: '2026-07-04T09:00:00Z',
          singleOperatorMode: true,
        },
      }),
    );
    saveRecords('pairRelation', [record]);

    const { validateAuthoringStore } = await import('../../../scripts/knowledge-authoring/validate');
    const { loadAllRecords, loadSourceRegistry } = await import('../../../scripts/knowledge-authoring/lib/io');
    const allRecords = loadAllRecords();
    const registry = loadSourceRegistry();
    const { governanceWarnings, orphanCitations } = validateAuthoringStore(
      allRecords,
      new Set(registry.sources.map((s) => s.sourceId)),
    );
    expect(orphanCitations).toHaveLength(0);
    expect(governanceWarnings).toHaveLength(1); // warning present...

    const { build } = await import('../../../scripts/knowledge-authoring/build');
    const { bundle } = build('0.1.0-e2e'); // ...but does not block the build
    expect(bundle.pairRelations).toHaveLength(1);
  });

  test('#21/#22 promote.ts is atomic: a forced build failure leaves the target directory byte-identical', async () => {
    const { saveRecords } = await import('../../../scripts/knowledge-authoring/lib/io');
    const lockedLifecycle: Partial<Lifecycle> = {
      status: 'locked',
      reviewerId: 'umit',
      reviewedAt: '2026-07-02T09:00:00Z',
      redTeamActorId: 'umit',
      redTeamedAt: '2026-07-03T09:00:00Z',
      lockAuthorityId: 'umit',
      lockedAt: '2026-07-04T09:00:00Z',
    };
    const good = KnowledgeRecordSchema.parse(
      basePairRecord({ recordId: 'pair-good', sourceRefs: ['tarot-ai-original-synthesis-v1'], lifecycle: lockedLifecycle }),
    );
    saveRecords('pairRelation', [good]);

    const { promote } = await import('../../../scripts/knowledge-authoring/promote');
    const scratchTarget = path.join(sandboxDir, 'scratch-live');
    const first = await promote('0.1.0-atomic', scratchTarget);
    const before = fs.readFileSync(first.bundlePath, 'utf-8');

    // Now inject a conflicting locked record to force build() to throw.
    const conflicting = KnowledgeRecordSchema.parse(
      basePairRecord({ recordId: 'pair-conflict', relationType: 'blocks', sourceRefs: ['tarot-ai-original-synthesis-v1'], lifecycle: lockedLifecycle }),
    );
    saveRecords('pairRelation', [good, conflicting]);

    await expect(promote('0.1.0-atomic', scratchTarget)).rejects.toThrow();
    const after = fs.readFileSync(first.bundlePath, 'utf-8');
    expect(after).toBe(before);
  });

  test('lockAuthorityId "claude" is rejected by transition.ts and the record file is left unchanged', async () => {
    const { saveRecords } = await import('../../../scripts/knowledge-authoring/lib/io');
    const redTeamed = KnowledgeRecordSchema.parse(
      basePairRecord({
        recordId: 'pair-guard',
        sourceRefs: ['tarot-ai-original-synthesis-v1'],
        lifecycle: {
          status: 'red-teamed',
          reviewerId: 'umit',
          reviewedAt: '2026-07-02T09:00:00Z',
          redTeamActorId: 'claude',
          redTeamedAt: '2026-07-03T09:00:00Z',
        },
      }),
    );
    saveRecords('pairRelation', [redTeamed]);
    const before = fs.readFileSync(
      path.join(sandboxDir, 'data/knowledge-authoring/records/pairRelations.json'),
      'utf-8',
    );

    const { transition } = await import('../../../scripts/knowledge-authoring/transition');
    expect(() =>
      transition({ recordType: 'pairRelation', recordId: 'pair-guard', to: 'locked', actorId: 'claude', at: '2026-07-05T09:00:00Z', verifySources: [] }),
    ).toThrow(/lockAuthorityId/);

    const after = fs.readFileSync(
      path.join(sandboxDir, 'data/knowledge-authoring/records/pairRelations.json'),
      'utf-8',
    );
    expect(after).toBe(before);
  });
});

describe("Sprint 5 pilot data (§7): real authoring-store content is schema-valid", () => {
  test('all 6 pilot pairRelation records in the real authoring store validate', () => {
    const filePath = path.join(process.cwd(), 'data/knowledge-authoring/records/pairRelations.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(raw.length).toBeGreaterThanOrEqual(5);
    expect(raw.length).toBeLessThanOrEqual(8);
    for (const entry of raw) {
      const result = KnowledgeRecordSchema.safeParse(entry);
      expect(result.success, `record ${entry.recordId} should validate`).toBe(true);
    }
  });

  test('exactly 3 pilot records are locked (Product Owner-approved) and 3 remain in draft (in revision, per HUMAN_LOCK_REVIEW_PACKET.md)', () => {
    const filePath = path.join(process.cwd(), 'data/knowledge-authoring/records/pairRelations.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const statuses = raw.map((r: { lifecycle: { status: string } }) => r.lifecycle.status);
    expect(statuses.filter((s: string) => s === 'locked')).toHaveLength(3);
    expect(statuses.filter((s: string) => s === 'draft')).toHaveLength(3);
  });

  test('every locked record has lockAuthorityId "umit", never an AI actor', () => {
    const filePath = path.join(process.cwd(), 'data/knowledge-authoring/records/pairRelations.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    for (const entry of raw) {
      if (entry.lifecycle.status === 'locked') {
        expect(entry.lifecycle.lockAuthorityId).toBe('umit');
      }
    }
  });

  test('sources.json has at least one original-synthesis and one ai-assisted-draft source', () => {
    const filePath = path.join(process.cwd(), 'data/knowledge-authoring/sources.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const types = raw.sources.map((s: { type: string }) => s.type);
    expect(types).toContain('original-synthesis');
    expect(types).toContain('ai-assisted-draft');
  });
});
