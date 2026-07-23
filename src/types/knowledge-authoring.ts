import { z } from 'zod';
import {
  PairRelationSchema,
  PositionRuleSchema,
  DomainModifierSchema,
  PersonaModifierSchema,
  SafetyConstraintSchema,
} from './knowledge';

export const SourceTypeSchema = z.enum([
  'classic-text', // published tarot reference work
  'academic', // psychology/symbolism scholarship
  'original-synthesis', // this project's own reasoning, not a copy of an external source
  'ai-assisted-draft', // NotebookLM or similar - research/drafting aid only
]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

/**
 * Rights/permission metadata for a source. Optional so the four existing
 * public-domain / original / ai-assisted sources are unaffected. Present on
 * copyrighted third-party works (e.g. the lineage-only reference book) to
 * record who holds the rights and what use is permitted - never to imply a
 * permission that isn't documented. `allowsRetrievalStorage: false` is the
 * default posture: no source's text may be stored in a retrieval system
 * unless a real permission says otherwise.
 */
export const SourceRightsSchema = z.object({
  rightsHolder: z.string().min(1),
  permissionStatus: z.enum(['unverified', 'licensed', 'denied']),
  permissionEvidence: z.string().nullable(), // path to a real permission document, or null
  usageScope: z.string().nullable(), // e.g. "abstract-principle-lineage-only"
  allowsRetrievalStorage: z.boolean(),
});
export type SourceRights = z.infer<typeof SourceRightsSchema>;

export const SourceSchema = z.object({
  sourceId: z.string().min(1),
  title: z.string().min(1),
  author: z.string().optional(),
  type: SourceTypeSchema,
  publicationYear: z.number().int().optional(),
  url: z.string().url().optional(),
  notes: z.string().optional(),
  rights: SourceRightsSchema.optional(),
});
export type Source = z.infer<typeof SourceSchema>;

export const SourceRegistrySchema = z.object({
  version: z.string().min(1),
  sources: z.array(SourceSchema),
});
export type SourceRegistry = z.infer<typeof SourceRegistrySchema>;

export const RecordTypeSchema = z.enum([
  'pairRelation',
  'positionRule',
  'domainModifier',
  'personaModifier',
  'safetyConstraint',
]);
export type RecordType = z.infer<typeof RecordTypeSchema>;

export const LifecycleStatusSchema = z.enum(['draft', 'reviewed', 'red-teamed', 'locked']);
export type LifecycleStatus = z.infer<typeof LifecycleStatusSchema>;

export const ActorRoleSchema = z.enum(['author', 'reviewer', 'red-team', 'lock-authority']);
export type ActorRole = z.infer<typeof ActorRoleSchema>;

export const DraftOriginSchema = z.enum(['human', 'ai-assisted']);
export type DraftOrigin = z.infer<typeof DraftOriginSchema>;

export const AiToolSchema = z.enum(['notebooklm', 'claude', 'other']);
export type AiTool = z.infer<typeof AiToolSchema>;

/**
 * Known non-human actor identifiers. Consulted for exactly two checks:
 * reviewerId and lockAuthorityId must never match it - human review and
 * Lock Authority can never be AI-performed. It is deliberately NOT
 * consulted for redTeamActorId: Claude acting as Red Team ("claude") is
 * an explicitly sanctioned identity for that one field. The guarantee is
 * field-scoped, not identity-scoped - see Sprint 5 plan §1.2.
 */
export const AI_ACTOR_IDS = ['claude', 'notebooklm', 'automated', 'pipeline'] as const;
export const isAiActorId = (id: string): boolean =>
  AI_ACTOR_IDS.some((marker) => id.trim().toLowerCase().includes(marker));

export const SourceVerificationSchema = z.object({
  sourceId: z.string().min(1),
  verifiedBy: z.string().min(1),
  verifiedAt: z.string().datetime(),
});
export type SourceVerification = z.infer<typeof SourceVerificationSchema>;

const STATUS_ORDER: LifecycleStatus[] = ['draft', 'reviewed', 'red-teamed', 'locked'];
const reached = (status: LifecycleStatus, gate: LifecycleStatus): boolean =>
  STATUS_ORDER.indexOf(status) >= STATUS_ORDER.indexOf(gate);

export const LifecycleSchema = z
  .object({
    status: LifecycleStatusSchema,
    authorId: z.string().min(1),
    reviewerId: z.string().optional(),
    reviewedAt: z.string().datetime().optional(),
    redTeamActorId: z.string().optional(),
    redTeamedAt: z.string().datetime().optional(),
    lockAuthorityId: z.string().optional(),
    lockedAt: z.string().datetime().optional(),
    draftOrigin: DraftOriginSchema,
    aiTool: AiToolSchema.optional(),
    singleOperatorMode: z.boolean().default(false),
  })
  .superRefine((lifecycle, ctx) => {
    if (lifecycle.draftOrigin === 'ai-assisted' && !lifecycle.aiTool) {
      ctx.addIssue({
        code: 'custom',
        path: ['aiTool'],
        message: 'ai-assisted drafts must name the aiTool used',
      });
    }
    if (lifecycle.draftOrigin === 'human' && lifecycle.aiTool) {
      ctx.addIssue({
        code: 'custom',
        path: ['aiTool'],
        message: 'aiTool may only be set when draftOrigin is ai-assisted',
      });
    }

    if (reached(lifecycle.status, 'reviewed')) {
      if (!lifecycle.reviewerId) {
        ctx.addIssue({
          code: 'custom',
          path: ['reviewerId'],
          message: 'reviewerId required at reviewed status or beyond',
        });
      } else if (isAiActorId(lifecycle.reviewerId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['reviewerId'],
          message:
            'reviewerId must be a named human - AI-assisted content requires at least one human review before it can be reviewed',
        });
      }
      if (!lifecycle.reviewedAt) {
        ctx.addIssue({
          code: 'custom',
          path: ['reviewedAt'],
          message: 'reviewedAt required at reviewed status or beyond',
        });
      }
    }

    if (reached(lifecycle.status, 'red-teamed')) {
      if (!lifecycle.redTeamActorId) {
        ctx.addIssue({
          code: 'custom',
          path: ['redTeamActorId'],
          message: 'redTeamActorId required at red-teamed status or beyond',
        });
      }
      if (!lifecycle.redTeamedAt) {
        ctx.addIssue({
          code: 'custom',
          path: ['redTeamedAt'],
          message: 'redTeamedAt required at red-teamed status or beyond',
        });
      }
    }

    if (reached(lifecycle.status, 'locked')) {
      if (!lifecycle.lockAuthorityId) {
        ctx.addIssue({
          code: 'custom',
          path: ['lockAuthorityId'],
          message: 'lockAuthorityId required to reach locked status',
        });
      } else if (isAiActorId(lifecycle.lockAuthorityId)) {
        ctx.addIssue({
          code: 'custom',
          path: ['lockAuthorityId'],
          message:
            'lockAuthorityId can never be an AI actor - locked status can only be granted by a named human, structurally, not by convention',
        });
      }
      if (!lifecycle.lockedAt) {
        ctx.addIssue({
          code: 'custom',
          path: ['lockedAt'],
          message: 'lockedAt required to reach locked status',
        });
      }
    }
  });
export type Lifecycle = z.infer<typeof LifecycleSchema>;

const RecordPayloadSchema = z.discriminatedUnion('recordType', [
  z.object({ recordType: z.literal('pairRelation'), payload: PairRelationSchema }),
  z.object({ recordType: z.literal('positionRule'), payload: PositionRuleSchema }),
  z.object({ recordType: z.literal('domainModifier'), payload: DomainModifierSchema }),
  z.object({ recordType: z.literal('personaModifier'), payload: PersonaModifierSchema }),
  z.object({ recordType: z.literal('safetyConstraint'), payload: SafetyConstraintSchema }),
]);

export const KnowledgeRecordSchema = z
  .object({
    recordId: z.string().min(1),
    sourceRefs: z.array(z.string().min(1)),
    sourceVerifications: z.array(SourceVerificationSchema).default([]),
    lifecycle: LifecycleSchema,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .and(RecordPayloadSchema)
  .superRefine((record, ctx) => {
    if (record.lifecycle.status === 'locked' && record.sourceRefs.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['sourceRefs'],
        message: 'locked records must cite at least one source',
      });
    }

    // Second additional binding requirement: AI-assisted content cannot
    // become red-teamed (or locked) until every cited source has been
    // individually verified by a named human - "kaynakları tek tek
    // doğrulanmadan red-teamed olamasın". Deliberately build-blocking
    // (a schema issue), unlike the authorId===reviewerId governance
    // warning, which is deliberately not (see validate.ts).
    if (record.lifecycle.draftOrigin === 'ai-assisted' && reached(record.lifecycle.status, 'red-teamed')) {
      const verifiedIds = new Set(
        record.sourceVerifications.filter((v) => !isAiActorId(v.verifiedBy)).map((v) => v.sourceId),
      );
      const unverified = record.sourceRefs.filter((ref) => !verifiedIds.has(ref));
      if (unverified.length > 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['sourceVerifications'],
          message: `ai-assisted record cannot reach red-teamed/locked status with unverified sources: ${unverified.join(', ')}`,
        });
      }
    }
  });
export type KnowledgeRecord = z.infer<typeof KnowledgeRecordSchema>;

// ---------------------------------------------------------------------------
// Human-Governed Methodology Extraction
// (docs/HUMAN_GOVERNED_METHODOLOGY_EXTRACTION_PROPOSAL_v1.0.md)
//
// A Lesson is the project's own, from-scratch statement of an ABSTRACT
// methodology principle. It never holds source text. The subject reference
// book is cited as `bookLineage` for transparency only and can NEVER be a
// lesson's sole backing - at least one independent (non-book) source must
// carry the evidentiary weight, human-verified before the lesson advances
// past `draft`. Claude may author drafts and red-team; only the Product Owner
// may lock (enforced by the shared LifecycleSchema).
// ---------------------------------------------------------------------------

export const PrincipleCategorySchema = z.enum([
  'intention-formation',
  'spread-position-logic',
  'user-agency',
  'non-prophecy-framing',
  'other',
]);
export type PrincipleCategory = z.infer<typeof PrincipleCategorySchema>;

/**
 * Book lineage is transparency-only. The two `false` literals are structural,
 * not a promise: there is deliberately no field on a Lesson that can hold the
 * book's text or image - `storedText`/`imageUsed` can only ever be `false`.
 */
export const BookLineageSchema = z.object({
  sourceId: z.string().min(1),
  extractionType: z.literal('abstract-principle-only'),
  storedText: z.literal(false),
  imageUsed: z.literal(false),
});
export type BookLineage = z.infer<typeof BookLineageSchema>;

export const IndependentSourceRefSchema = z.object({
  sourceId: z.string().min(1),
  note: z.string().min(1),
});
export type IndependentSourceRef = z.infer<typeof IndependentSourceRefSchema>;

/**
 * Distinctive-phrase + structural overlap review. When present at `reviewed`
 * status or beyond it must be human-performed with an `original` verdict -
 * a lesson that still reads too close to the source cannot advance.
 */
export const SimilarityReviewSchema = z.object({
  reviewedBy: z.string().min(1),
  reviewedAt: z.string().datetime(),
  distinctivePhraseOverlap: z.enum(['none', 'flagged']),
  structuralOverlap: z.enum(['none', 'flagged']),
  verdict: z.enum(['original', 'revise']),
});
export type SimilarityReview = z.infer<typeof SimilarityReviewSchema>;

export const MethodologyLessonSchema = z
  .object({
    lessonId: z.string().min(1),
    principleCategory: PrincipleCategorySchema,
    abstractPrinciple: z.string().min(1),
    originalStatement: z.string().min(1),
    independentSources: z.array(IndependentSourceRefSchema),
    bookLineage: BookLineageSchema.optional(),
    // nullish: a draft can carry an explicit `null` to document "no governed
    // review yet"; required (non-null) once status reaches `reviewed`.
    similarityReview: SimilarityReviewSchema.nullish(),
    sourceVerifications: z.array(SourceVerificationSchema).default([]),
    lifecycle: LifecycleSchema,
    targetRecordType: RecordTypeSchema.optional(),
    notes: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .superRefine((lesson, ctx) => {
    const bookId = lesson.bookLineage?.sourceId;
    const independentIds = lesson.independentSources
      .map((s) => s.sourceId)
      .filter((id) => id !== bookId);

    // Rule 7 + 8: at least one independent (non-book) source; the book is
    // never sole backing. Enforced at every status, including draft.
    if (independentIds.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['independentSources'],
        message:
          'a methodology lesson must cite at least one independent (non-book) source; the book may never be the sole backing',
      });
    }

    if (reached(lesson.lifecycle.status, 'reviewed')) {
      // Rule 9: a human similarity review with an `original` verdict is
      // required before a lesson advances past draft.
      if (!lesson.similarityReview) {
        ctx.addIssue({
          code: 'custom',
          path: ['similarityReview'],
          message: 'similarityReview required at reviewed status or beyond',
        });
      } else {
        if (isAiActorId(lesson.similarityReview.reviewedBy)) {
          ctx.addIssue({
            code: 'custom',
            path: ['similarityReview', 'reviewedBy'],
            message: 'similarity review must be performed by a named human',
          });
        }
        if (lesson.similarityReview.verdict !== 'original') {
          ctx.addIssue({
            code: 'custom',
            path: ['similarityReview', 'verdict'],
            message: 'a lesson cannot advance past draft unless the similarity verdict is "original"',
          });
        }
      }

      // Rule 7: at least one independent source must be human-verified
      // before advancement (AI verifications don't count).
      const humanVerifiedIds = new Set(
        lesson.sourceVerifications.filter((v) => !isAiActorId(v.verifiedBy)).map((v) => v.sourceId),
      );
      if (!independentIds.some((id) => humanVerifiedIds.has(id))) {
        ctx.addIssue({
          code: 'custom',
          path: ['sourceVerifications'],
          message:
            'at least one independent source must be human-verified before a lesson advances past draft',
        });
      }
    }
  });
export type MethodologyLesson = z.infer<typeof MethodologyLessonSchema>;

export const BuildManifestSchema = z.object({
  knowledgeVersion: z.string().min(1),
  builtAt: z.string().datetime(),
  recordCounts: z.object({
    pairRelations: z.number().int().min(0),
    positionRules: z.number().int().min(0),
    domainModifiers: z.number().int().min(0),
    personaModifiers: z.number().int().min(0),
    safetyConstraints: z.number().int().min(0),
  }),
  sourceCount: z.number().int().min(0),
  lockedRecordCount: z.number().int().min(0),
  schemaVersion: z.string().min(1),
  checksum: z.string().min(1),
});
export type BuildManifest = z.infer<typeof BuildManifestSchema>;
