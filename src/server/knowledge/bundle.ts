import fs from 'fs';
import path from 'path';
import { KnowledgeBundle, KnowledgeBundleSchema } from '../../types/knowledge';
import { KnowledgeBundleInvalidError, KnowledgeBundleNotFoundError } from './errors';

const BUNDLE_PATH = path.join(process.cwd(), 'data', 'knowledge', 'bundle-v0.1.0.json');

let cache: KnowledgeBundle | null = null;

/**
 * Loads and validates the bundle once, then caches it - same pattern as
 * cards.ts's getAllCards(). Throws typed errors (not a generic Error) so
 * the caller (LocalJsonKnowledgeProvider -> resolveKnowledge()) can turn a
 * failure into an observable 'fallback' status with a specific errorCode,
 * rather than a bare try/catch swallowing what went wrong.
 */
export function loadKnowledgeBundle(): KnowledgeBundle {
  if (cache) return cache;

  if (!fs.existsSync(BUNDLE_PATH)) {
    throw new KnowledgeBundleNotFoundError(`Knowledge bundle not found at ${BUNDLE_PATH}`);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(BUNDLE_PATH, 'utf-8'));
  } catch {
    throw new KnowledgeBundleInvalidError(`Knowledge bundle at ${BUNDLE_PATH} is not valid JSON`);
  }

  const result = KnowledgeBundleSchema.safeParse(raw);
  if (!result.success) {
    throw new KnowledgeBundleInvalidError(`Knowledge bundle failed schema validation: ${result.error.message}`);
  }

  cache = result.data;
  return cache;
}
