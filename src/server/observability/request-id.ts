/**
 * Request correlation id (Sprint S3). Middleware sets `x-request-id` on every
 * /api request; handlers read it here, falling back to a freshly generated id
 * so a directly-invoked handler (e.g. in a test) still has one. Never a secret.
 */
export const REQUEST_ID_HEADER = 'x-request-id';

export function getOrCreateRequestId(headers: Headers): string {
  const existing = headers.get(REQUEST_ID_HEADER);
  if (existing && existing.trim() !== '') return existing;
  return generateRequestId();
}

export function generateRequestId(): string {
  // crypto.randomUUID is available in the Next runtime and Node 18+.
  return globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
