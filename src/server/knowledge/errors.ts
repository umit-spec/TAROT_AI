export class KnowledgeBundleNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KnowledgeBundleNotFoundError';
  }
}

export class KnowledgeBundleInvalidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KnowledgeBundleInvalidError';
  }
}

/** Maps a caught error to a stable, loggable code - never the raw error message (could vary run to run). */
export function classifyKnowledgeError(err: unknown): string {
  if (err instanceof KnowledgeBundleNotFoundError) return 'bundle_not_found';
  if (err instanceof KnowledgeBundleInvalidError) return 'bundle_invalid';
  return 'unknown_error';
}
