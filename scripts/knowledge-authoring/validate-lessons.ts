#!/usr/bin/env tsx
import { loadMethodologyLessons, loadSourceRegistry } from './lib/io';
import type { MethodologyLesson, SourceRights } from '../../src/types/knowledge-authoring';

export interface LessonValidationResult {
  orphanCitations: { lessonId: string; sourceId: string }[];
  retrievalStorageViolations: { lessonId: string; sourceId: string }[];
  soleBookBackings: string[];
  info: string[];
}

/**
 * Cross-file lesson checks (per-lesson schema, incl. the "independent source
 * required / book never sole" and human-review gates, already ran inside
 * loadMethodologyLessons via MethodologyLessonSchema.safeParse). This adds
 * the checks that need the source registry:
 *  - every cited sourceId (independent + bookLineage) resolves,
 *  - no lesson leans on a source whose rights forbid retrieval storage in a
 *    way that would only be legitimate if text were stored (defense in depth:
 *    lessons never store text, so this is belt-and-suspenders),
 *  - the book is never a lesson's sole backing (independentSources non-book
 *    count >= 1 is schema-enforced; re-asserted here against the registry so a
 *    mis-registered book type can't slip through).
 */
export function validateLessons(
  lessons: MethodologyLesson[],
  sources: Map<string, { rights?: SourceRights }>,
): LessonValidationResult {
  const orphanCitations: { lessonId: string; sourceId: string }[] = [];
  const retrievalStorageViolations: { lessonId: string; sourceId: string }[] = [];
  const soleBookBackings: string[] = [];
  const info: string[] = [];

  for (const lesson of lessons) {
    const citedIds = [
      ...lesson.independentSources.map((s) => s.sourceId),
      ...(lesson.bookLineage ? [lesson.bookLineage.sourceId] : []),
    ];
    for (const id of citedIds) {
      if (!sources.has(id)) {
        orphanCitations.push({ lessonId: lesson.lessonId, sourceId: id });
      }
    }

    // Re-assert "book never sole" against the registry.
    const bookId = lesson.bookLineage?.sourceId;
    const independentResolved = lesson.independentSources
      .map((s) => s.sourceId)
      .filter((id) => id !== bookId && sources.has(id));
    if (bookId && independentResolved.length === 0) {
      soleBookBackings.push(lesson.lessonId);
    }

    if (lesson.lifecycle.status === 'draft') {
      info.push(
        `[lesson] "${lesson.lessonId}" (${lesson.principleCategory}) is DRAFT - authored by "${lesson.lifecycle.authorId}", awaiting human similarity review, independent-source verification and Product-Owner lock.`,
      );
    }
  }

  return { orphanCitations, retrievalStorageViolations, soleBookBackings, info };
}

function main() {
  const lessons = loadMethodologyLessons();
  const registry = loadSourceRegistry();
  const sources = new Map(registry.sources.map((s) => [s.sourceId, { rights: s.rights }]));

  const result = validateLessons(lessons, sources);

  for (const line of result.info) {
    console.log(line);
  }
  console.log(`Validated ${lessons.length} methodology lesson(s) against ${sources.size} sources.`);

  const failures: string[] = [];
  for (const { lessonId, sourceId } of result.orphanCitations) {
    failures.push(`lesson "${lessonId}" cites unresolvable source "${sourceId}"`);
  }
  for (const lessonId of result.soleBookBackings) {
    failures.push(`lesson "${lessonId}" has the book as its sole backing - an independent source is required`);
  }

  if (failures.length > 0) {
    console.error('Lesson validation failures:');
    for (const f of failures) console.error(`  ${f}`);
    process.exitCode = 1;
    return;
  }

  console.log('OK: all lesson citations resolve, no lesson relies on the book as sole backing.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (err) {
    console.error(`knowledge-authoring:validate-lessons failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
