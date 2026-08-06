/**
 * Bounded JSON body reader (H4).
 *
 * `await request.json()` buffers the entire body before any schema runs, so
 * H1's 1000-character question limit never sees an oversized payload — Zod
 * rejects it only after the whole thing is already in memory. This reads with
 * a hard byte ceiling and aborts as soon as it is exceeded.
 *
 * ORDER MATTERS: size is checked while streaming, BEFORE parsing and before
 * the schema. A 50 MB body is refused after ~64 KB has been read, not after
 * 50 MB has been buffered and parsed.
 */

export const DEFAULT_MAX_BODY_BYTES = 64 * 1024;

export type BodyReadError = 'body_too_large' | 'invalid_json_body';

export interface BodyReadResult {
  ok: boolean;
  value?: unknown;
  error?: BodyReadError;
}

export function maxBodyBytes(env: Record<string, string | undefined> = process.env): number {
  const n = Number(env.MAX_BODY_BYTES ?? DEFAULT_MAX_BODY_BYTES);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_MAX_BODY_BYTES;
}

/**
 * Read and parse a JSON body, refusing anything over `limit` bytes.
 *
 * The declared content-length is used as a fast rejection when present, but it
 * is NEVER trusted as the real size — a client can understate or omit it, so
 * the streamed byte count is what actually enforces the ceiling.
 */
export async function readJsonBody(
  request: Request,
  limit: number = maxBodyBytes()
): Promise<BodyReadResult> {
  const declared = Number(request.headers.get('content-length') ?? NaN);
  if (Number.isFinite(declared) && declared > limit) {
    return { ok: false, error: 'body_too_large' };
  }

  const body = request.body;

  // No stream available (some runtimes and most test doubles): fall back to
  // text(), then enforce the same ceiling on what was actually received.
  if (!body) {
    let text: string;
    try {
      text = await request.text();
    } catch {
      return { ok: false, error: 'invalid_json_body' };
    }
    if (new TextEncoder().encode(text).length > limit) {
      return { ok: false, error: 'body_too_large' };
    }
    return parseJson(text);
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > limit) {
        // Stop pulling immediately - the point is not to buffer the rest.
        await reader.cancel().catch(() => {});
        return { ok: false, error: 'body_too_large' };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, error: 'invalid_json_body' };
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }

  return parseJson(new TextDecoder().decode(merged));
}

function parseJson(text: string): BodyReadResult {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, error: 'invalid_json_body' };
  }
}
