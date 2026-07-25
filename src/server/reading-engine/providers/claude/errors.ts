export class ClaudeHttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ClaudeHttpError';
  }
}

export class ClaudeTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClaudeTimeoutError';
  }
}

/** Invalid JSON, failed Zod validation, or a structurally wrong card list - never retried. */
export class ClaudeOutputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClaudeOutputValidationError';
  }
}

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503]);

/**
 * Only transient failures are retryable: timeouts and the specific HTTP
 * statuses above. 400/401/403, schema failures, and red-line violations
 * are never retried - retrying an auth error or a bad-output error just
 * wastes the single retry budget on something that will fail identically.
 */
export function isRetryable(err: unknown): boolean {
  if (err instanceof ClaudeTimeoutError) return true;
  if (err instanceof ClaudeHttpError) return RETRYABLE_STATUSES.has(err.status);
  return false;
}
