import type { RecordType } from '../../../src/types/knowledge-authoring';

/** Strict RFC4180-style CSV parser: quoted fields, embedded commas, "" escaping, embedded newlines. */
export function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  let i = 0;

  const pushCell = () => {
    row.push(cell);
    cell = '';
  };
  const pushRow = () => {
    pushCell();
    rows.push(row);
    row = [];
  };

  while (i < content.length) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cell += ch;
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ',') {
      pushCell();
      i += 1;
      continue;
    }
    if (ch === '\r') {
      i += 1;
      continue;
    }
    if (ch === '\n') {
      pushRow();
      i += 1;
      continue;
    }
    cell += ch;
    i += 1;
  }
  if (cell.length > 0 || row.length > 0) pushRow();

  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

export function parseCsvToObjects(content: string): Record<string, string>[] {
  const rows = parseCsv(content);
  if (rows.length === 0) return [];
  const [header, ...body] = rows;
  return body.map((cells) => {
    const obj: Record<string, string> = {};
    header.forEach((col, idx) => {
      obj[col] = cells[idx] ?? '';
    });
    return obj;
  });
}

/**
 * List-valued CSV cells hold a JSON array as the cell text, not
 * comma-flattened values - per Sprint 5 decision 6, a comma-flattened list
 * item that itself contains a comma would silently corrupt on ingest.
 * An empty cell means an empty list, not a parse error.
 */
export function parseJsonArrayCell(raw: string, columnName: string): string[] {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    throw new Error(`Column "${columnName}" is not valid JSON: ${(err as Error).message} (got: ${raw})`);
  }
  if (!Array.isArray(parsed) || !parsed.every((v) => typeof v === 'string')) {
    throw new Error(`Column "${columnName}" must be a JSON array of strings (got: ${raw})`);
  }
  return parsed;
}

export interface SourceVerificationCell {
  sourceId: string;
  verifiedBy: string;
  verifiedAt: string;
}

export function parseSourceVerificationsCell(raw: string): SourceVerificationCell[] {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    throw new Error(`Column "source_verifications" is not valid JSON: ${(err as Error).message} (got: ${raw})`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`Column "source_verifications" must be a JSON array (got: ${raw})`);
  }
  return parsed as SourceVerificationCell[];
}

/**
 * Builds the raw (pre-Zod) record shape from one CSV row, for a given
 * recordType. This is intentionally permissive about missing optional
 * columns - KnowledgeRecordSchema.safeParse is the actual gate, run by
 * ingest.ts right after this. csv.ts's only job is "turn one CSV row into
 * the object shape the schema expects," not "decide if it's valid."
 */
export function csvRowToRawRecord(recordType: RecordType, row: Record<string, string>): unknown {
  const envelope = {
    recordId: row.record_id,
    recordType,
    sourceRefs: parseJsonArrayCell(row.source_refs ?? '', 'source_refs'),
    sourceVerifications: parseSourceVerificationsCell(row.source_verifications ?? ''),
    createdAt: row.created_at,
    updatedAt: row.created_at,
    lifecycle: {
      status: row.status || 'draft',
      authorId: row.author_id,
      reviewerId: row.reviewer_id || undefined,
      reviewedAt: row.reviewed_at || undefined,
      redTeamActorId: row.red_team_actor_id || undefined,
      redTeamedAt: row.red_teamed_at || undefined,
      lockAuthorityId: row.lock_authority_id || undefined,
      lockedAt: row.locked_at || undefined,
      draftOrigin: row.draft_origin || 'human',
      aiTool: row.ai_tool || undefined,
      singleOperatorMode: row.author_id && row.reviewer_id ? row.author_id === row.reviewer_id : false,
    },
  };

  switch (recordType) {
    case 'pairRelation':
      return {
        ...envelope,
        payload: {
          previousCardId: row.previous_card_id,
          focusCardId: row.focus_card_id,
          relationType: row.relation_type,
          semanticEffect: parseJsonArrayCell(row.semantic_effects ?? '', 'semantic_effects'),
          warnings: parseJsonArrayCell(row.warnings ?? '', 'warnings'),
          sourceRefs: [],
        },
      };
    case 'positionRule':
      return {
        ...envelope,
        payload: {
          position: row.position,
          spread: row.spread,
          emphasis: row.emphasis,
          framingGuidance: row.framing_guidance,
        },
      };
    case 'domainModifier':
      return {
        ...envelope,
        payload: {
          domain: row.domain,
          emphasisKeywords: parseJsonArrayCell(row.emphasis_keywords ?? '', 'emphasis_keywords'),
          cautionNotes: parseJsonArrayCell(row.caution_notes ?? '', 'caution_notes'),
        },
      };
    case 'personaModifier':
      return {
        ...envelope,
        payload: {
          persona: row.persona,
          toneGuidance: row.tone_guidance,
          depthGuidance: row.depth_guidance || undefined,
        },
      };
    case 'safetyConstraint':
      return {
        ...envelope,
        payload: {
          flag: row.flag,
          action: row.action,
          disclaimerText: row.disclaimer_text || undefined,
        },
      };
  }
}
