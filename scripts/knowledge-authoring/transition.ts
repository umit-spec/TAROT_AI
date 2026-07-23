#!/usr/bin/env tsx
import {
  KnowledgeRecordSchema,
  LifecycleStatusSchema,
  RecordTypeSchema,
  type KnowledgeRecord,
  type LifecycleStatus,
  type RecordType,
} from '../../src/types/knowledge-authoring';
import { loadRecords, saveRecords } from './lib/io';

interface Args {
  recordType: RecordType;
  recordId: string;
  to: LifecycleStatus;
  actorId: string;
  at: string;
  verifySources: string[];
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string): string | undefined => {
    const idx = argv.indexOf(flag);
    return idx >= 0 ? argv[idx + 1] : undefined;
  };
  const getAll = (flag: string): string[] => {
    const out: string[] = [];
    argv.forEach((a, i) => {
      if (a === flag) out.push(argv[i + 1]);
    });
    return out;
  };

  const recordType = get('--recordType');
  const recordId = get('--recordId');
  const to = get('--to');
  const actorId = get('--actorId');
  if (!recordType || !recordId || !to || !actorId) {
    throw new Error(
      'Usage: transition.ts --recordType <type> --recordId <id> --to <reviewed|red-teamed|locked> --actorId <id> [--at <ISO timestamp>] [--verifySource <sourceId>]',
    );
  }
  return {
    recordType: RecordTypeSchema.parse(recordType),
    recordId,
    to: LifecycleStatusSchema.parse(to),
    actorId,
    at: get('--at') ?? new Date().toISOString(),
    verifySources: getAll('--verifySource'),
  };
}

export function transition(args: Args): KnowledgeRecord {
  const records = loadRecords(args.recordType);
  const index = records.findIndex((r) => r.recordId === args.recordId);
  if (index === -1) {
    throw new Error(`No ${args.recordType} record found with recordId "${args.recordId}"`);
  }
  const current = records[index];

  const lifecycle = { ...current.lifecycle, status: args.to };
  if (args.to === 'reviewed') {
    lifecycle.reviewerId = args.actorId;
    lifecycle.reviewedAt = args.at;
  } else if (args.to === 'red-teamed') {
    lifecycle.redTeamActorId = args.actorId;
    lifecycle.redTeamedAt = args.at;
  } else if (args.to === 'locked') {
    lifecycle.lockAuthorityId = args.actorId;
    lifecycle.lockedAt = args.at;
  }

  const sourceVerifications = [...current.sourceVerifications];
  for (const sourceId of args.verifySources) {
    sourceVerifications.push({ sourceId, verifiedBy: args.actorId, verifiedAt: args.at });
  }

  const updated = { ...current, lifecycle, sourceVerifications, updatedAt: args.at };
  const result = KnowledgeRecordSchema.safeParse(updated);
  if (!result.success) {
    throw new Error(`Transition rejected by schema (this is the guarantee, not a bug): ${result.error.message}`);
  }

  const next = [...records];
  next[index] = result.data;
  saveRecords(args.recordType, next);
  return result.data;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const updated = transition(args);
  console.log(`${args.recordType} "${args.recordId}" -> ${updated.lifecycle.status} (actor: ${args.actorId})`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (err) {
    console.error(`knowledge-authoring:transition failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
