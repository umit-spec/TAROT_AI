import { describe, it, expect } from 'vitest';
import {
  MethodologyLessonSchema,
  SourceRightsSchema,
  SourceSchema,
  type MethodologyLesson,
} from '../../types/knowledge-authoring';
import { loadMethodologyLessons, loadSourceRegistry } from '../../../scripts/knowledge-authoring/lib/io';
import { validateLessons } from '../../../scripts/knowledge-authoring/validate-lessons';

const BASE_LIFECYCLE = {
  status: 'draft' as const,
  authorId: 'claude',
  draftOrigin: 'ai-assisted' as const,
  aiTool: 'claude' as const,
  singleOperatorMode: false,
};

function draftLesson(overrides: Record<string, unknown> = {}): unknown {
  return {
    lessonId: 'lesson-test-001',
    principleCategory: 'non-prophecy-framing',
    abstractPrinciple: 'A reading is a reflection aid, not a prediction.',
    originalStatement: 'Written from scratch in the project voice.',
    independentSources: [{ sourceId: 'tarot-ai-original-synthesis-v1', note: 'project framing' }],
    bookLineage: {
      sourceId: 'baslangic-tarot-rehberi-2025',
      extractionType: 'abstract-principle-only',
      storedText: false,
      imageUsed: false,
    },
    similarityReview: null,
    sourceVerifications: [],
    lifecycle: BASE_LIFECYCLE,
    createdAt: '2026-07-23T12:00:00.000Z',
    updatedAt: '2026-07-23T12:00:00.000Z',
    ...overrides,
  };
}

describe('SourceRights schema', () => {
  it('accepts a rights block and keeps it optional on existing sources', () => {
    expect(
      SourceRightsSchema.safeParse({
        rightsHolder: 'The Bill Store',
        permissionStatus: 'unverified',
        permissionEvidence: null,
        usageScope: 'abstract-principle-lineage-only',
        allowsRetrievalStorage: false,
      }).success,
    ).toBe(true);
    // a source with no rights field still validates (backward compatible)
    expect(
      SourceSchema.safeParse({
        sourceId: 's',
        title: 't',
        type: 'classic-text',
      }).success,
    ).toBe(true);
  });
});

describe('MethodologyLesson schema', () => {
  it('accepts a valid Claude-authored draft with a null similarityReview', () => {
    const parsed = MethodologyLessonSchema.safeParse(draftLesson());
    expect(parsed.success).toBe(true);
  });

  it('rejects a lesson whose only source is the book (book never sole backing)', () => {
    const parsed = MethodologyLessonSchema.safeParse(
      draftLesson({
        independentSources: [{ sourceId: 'baslangic-tarot-rehberi-2025', note: 'book only' }],
      }),
    );
    expect(parsed.success).toBe(false);
  });

  it('structurally forbids storing book text (storedText literal false)', () => {
    const parsed = MethodologyLessonSchema.safeParse(
      draftLesson({
        bookLineage: {
          sourceId: 'baslangic-tarot-rehberi-2025',
          extractionType: 'abstract-principle-only',
          storedText: true,
          imageUsed: false,
        },
      }),
    );
    expect(parsed.success).toBe(false);
  });

  it('blocks advancement to reviewed without a similarity review', () => {
    const parsed = MethodologyLessonSchema.safeParse(
      draftLesson({
        lifecycle: { ...BASE_LIFECYCLE, status: 'reviewed', reviewerId: 'umit', reviewedAt: '2026-07-23T12:00:00.000Z' },
        similarityReview: null,
      }),
    );
    expect(parsed.success).toBe(false);
  });

  it('blocks advancement when the similarity verdict is not "original"', () => {
    const parsed = MethodologyLessonSchema.safeParse(
      draftLesson({
        lifecycle: { ...BASE_LIFECYCLE, status: 'reviewed', reviewerId: 'umit', reviewedAt: '2026-07-23T12:00:00.000Z' },
        similarityReview: {
          reviewedBy: 'umit',
          reviewedAt: '2026-07-23T12:00:00.000Z',
          distinctivePhraseOverlap: 'flagged',
          structuralOverlap: 'none',
          verdict: 'revise',
        },
        sourceVerifications: [
          { sourceId: 'tarot-ai-original-synthesis-v1', verifiedBy: 'umit', verifiedAt: '2026-07-23T12:00:00.000Z' },
        ],
      }),
    );
    expect(parsed.success).toBe(false);
  });

  it('rejects an AI similarity reviewer at reviewed status', () => {
    const parsed = MethodologyLessonSchema.safeParse(
      draftLesson({
        lifecycle: { ...BASE_LIFECYCLE, status: 'reviewed', reviewerId: 'umit', reviewedAt: '2026-07-23T12:00:00.000Z' },
        similarityReview: {
          reviewedBy: 'claude',
          reviewedAt: '2026-07-23T12:00:00.000Z',
          distinctivePhraseOverlap: 'none',
          structuralOverlap: 'none',
          verdict: 'original',
        },
        sourceVerifications: [
          { sourceId: 'tarot-ai-original-synthesis-v1', verifiedBy: 'umit', verifiedAt: '2026-07-23T12:00:00.000Z' },
        ],
      }),
    );
    expect(parsed.success).toBe(false);
  });

  it('requires a human-verified independent source before advancement', () => {
    const parsed = MethodologyLessonSchema.safeParse(
      draftLesson({
        lifecycle: { ...BASE_LIFECYCLE, status: 'reviewed', reviewerId: 'umit', reviewedAt: '2026-07-23T12:00:00.000Z' },
        similarityReview: {
          reviewedBy: 'umit',
          reviewedAt: '2026-07-23T12:00:00.000Z',
          distinctivePhraseOverlap: 'none',
          structuralOverlap: 'none',
          verdict: 'original',
        },
        // only an AI verification present -> must fail
        sourceVerifications: [
          { sourceId: 'tarot-ai-original-synthesis-v1', verifiedBy: 'claude', verifiedAt: '2026-07-23T12:00:00.000Z' },
        ],
      }),
    );
    expect(parsed.success).toBe(false);
  });
});

describe('shipped lessons + registry', () => {
  it('all shipped lessons validate and are still drafts (no auto-lock)', () => {
    const lessons = loadMethodologyLessons();
    expect(lessons.length).toBeGreaterThan(0);
    for (const lesson of lessons) {
      expect(lesson.lifecycle.status).toBe('draft');
      expect(lesson.lifecycle.authorId).toBe('claude');
    }
  });

  it('the book is registered lineage-only and never a lesson sole backing', () => {
    const registry = loadSourceRegistry();
    const book = registry.sources.find((s) => s.sourceId === 'baslangic-tarot-rehberi-2025');
    expect(book).toBeDefined();
    expect(book?.rights?.allowsRetrievalStorage).toBe(false);

    const sources = new Map(registry.sources.map((s) => [s.sourceId, { rights: s.rights }]));
    const result = validateLessons(loadMethodologyLessons() as MethodologyLesson[], sources);
    expect(result.orphanCitations).toHaveLength(0);
    expect(result.soleBookBackings).toHaveLength(0);
  });
});
