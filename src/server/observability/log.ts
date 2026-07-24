/**
 * Structured logging (Sprint S3, D4/D5). The log record is built from a fixed
 * set of NON-sensitive fields only. It NEVER carries the user's question text,
 * reflection text, crisis text, or provider payloads - those are structurally
 * absent from the builder's input type, so they cannot leak by accident. A
 * test asserts a request's free-text never appears in the emitted record.
 */

export interface ReadingLogRecord {
  event: 'reading_request';
  requestId: string;
  status: number;
  latencyMs: number;
  outcome: 'crisis' | 'reading' | 'invalid' | 'rate-limited' | 'error';
  // Derived, non-free-text signals only:
  persona?: string;
  questionDomain?: string;
  crisis?: boolean;
  safetyFlagCount?: number;
  provider?: string;
  fallbackReason?: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface ReadingLogInput {
  requestId: string;
  status: number;
  latencyMs: number;
  outcome: ReadingLogRecord['outcome'];
  persona?: string;
  questionDomain?: string;
  crisis?: boolean;
  safetyFlagCount?: number;
  provider?: string;
  fallbackReason?: string;
  inputTokens?: number;
  outputTokens?: number;
}

/** Pure builder - no I/O, so it can be unit-tested for redaction. */
export function buildReadingLogRecord(input: ReadingLogInput): ReadingLogRecord {
  return {
    event: 'reading_request',
    requestId: input.requestId,
    status: input.status,
    latencyMs: Math.round(input.latencyMs),
    outcome: input.outcome,
    ...(input.persona ? { persona: input.persona } : {}),
    ...(input.questionDomain ? { questionDomain: input.questionDomain } : {}),
    ...(input.crisis !== undefined ? { crisis: input.crisis } : {}),
    ...(input.safetyFlagCount !== undefined ? { safetyFlagCount: input.safetyFlagCount } : {}),
    ...(input.provider ? { provider: input.provider } : {}),
    ...(input.fallbackReason ? { fallbackReason: input.fallbackReason } : {}),
    ...(input.inputTokens !== undefined ? { inputTokens: input.inputTokens } : {}),
    ...(input.outputTokens !== undefined ? { outputTokens: input.outputTokens } : {}),
  };
}

export function logReading(input: ReadingLogInput): void {
  // Structured single-line JSON to stdout - safe for log aggregators; no
  // sensitive text, ever. Silent in the test environment to keep output clean.
  if (process.env.NODE_ENV === 'test') return;
  console.log(JSON.stringify(buildReadingLogRecord(input)));
}
