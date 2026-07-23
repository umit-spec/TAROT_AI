#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import {
  KnowledgeRecordSchema,
  RecordTypeSchema,
  type KnowledgeRecord,
  type RecordType,
} from '../../src/types/knowledge-authoring';
import { parseCsvToObjects, csvRowToRawRecord } from './lib/csv';
import { loadRecords, saveRecords } from './lib/io';

interface Args {
  recordType: RecordType;
  file: string;
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string): string | undefined => {
    const idx = argv.indexOf(flag);
    return idx >= 0 ? argv[idx + 1] : undefined;
  };
  const recordTypeRaw = get('--recordType');
  const file = get('--file');
  if (!recordTypeRaw || !file) {
    throw new Error('Usage: ingest.ts --recordType <pairRelation|positionRule|domainModifier|personaModifier|safetyConstraint> --file <path.csv|path.json>');
  }
  const recordType = RecordTypeSchema.parse(recordTypeRaw);
  return { recordType, file };
}

function loadRawRecords(recordType: RecordType, filePath: string): unknown[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (filePath.endsWith('.csv')) {
    return parseCsvToObjects(content).map((row) => csvRowToRawRecord(recordType, row));
  }
  if (filePath.endsWith('.json')) {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) throw new Error(`${filePath} must contain a JSON array of records`);
    return parsed;
  }
  throw new Error(`Unsupported file extension for ${filePath} - expected .csv or .json`);
}

export function ingest(recordType: RecordType, filePath: string): { added: string[]; updated: string[] } {
  const raw = loadRawRecords(recordType, filePath);

  const validated: KnowledgeRecord[] = raw.map((entry, index) => {
    const result = KnowledgeRecordSchema.safeParse(entry);
    if (!result.success) {
      const recordId = typeof entry === 'object' && entry && 'recordId' in entry ? String((entry as { recordId: unknown }).recordId) : `#${index}`;
      throw new Error(`Ingest row ${recordId} failed validation: ${result.error.message}`);
    }
    if (result.data.lifecycle.status !== 'draft') {
      throw new Error(
        `Ingest row ${result.data.recordId} has status "${result.data.lifecycle.status}" - ingest.ts only accepts new draft content; lifecycle transitions go through transition.ts`,
      );
    }
    return result.data;
  });

  const existing = loadRecords(recordType);
  const byId = new Map(existing.map((r) => [r.recordId, r]));

  const added: string[] = [];
  const updated: string[] = [];

  for (const record of validated) {
    const current = byId.get(record.recordId);
    if (current && current.lifecycle.status === 'locked') {
      const samePayload = JSON.stringify(current.payload) === JSON.stringify((record as unknown as { payload: unknown }).payload);
      if (!samePayload) {
        throw new Error(
          `Refusing to ingest a payload change to locked record "${record.recordId}" - demote its status explicitly via transition.ts first`,
        );
      }
      continue; // identical re-ingest of already-locked content is a harmless no-op
    }
    if (current) {
      updated.push(record.recordId);
    } else {
      added.push(record.recordId);
    }
    byId.set(record.recordId, record);
  }

  saveRecords(recordType, Array.from(byId.values()));
  return { added, updated };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = ingest(args.recordType, path.resolve(args.file));
  console.log(`Ingested into ${args.recordType}: ${result.added.length} added, ${result.updated.length} updated.`);
  if (result.added.length) console.log(`  added: ${result.added.join(', ')}`);
  if (result.updated.length) console.log(`  updated: ${result.updated.join(', ')}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (err) {
    console.error(`knowledge-authoring:ingest failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
