import { NextRequest, NextResponse } from 'next/server';
import { classifyIntake, isCrisisFlag } from '../../../../server/intake';
import { CRISIS_MESSAGE, CRISIS_RESOURCES } from '../../../../server/intake/crisis-resources';
import {
  CrisisResponseSchema,
  FramingPreviewResponseSchema,
  PreviewRequestSchema,
} from '../../../../types/api';
import { presentFraming } from '../../../../lib/framing-presenter';
import { REQUEST_ID_HEADER, getOrCreateRequestId } from '../../../../server/observability/request-id';
import { logPreview } from '../../../../server/observability/log';
import {
  RateLimiter,
  clientKey,
  isRateLimitEnabled,
  previewRateLimitPerMinute,
} from '../../../../server/observability/rate-limit';

// Independent, separately-configured limiter (docs/ADR-UX-FRAMING-PREVIEW.md
// R11). Distinct instance from the reading route's limiter and its own
// threshold, so the normal edit -> re-preview loop is not punished.
const limiter = new RateLimiter(previewRateLimitPerMinute(), 60_000);

function withRequestId(response: NextResponse, requestId: string): NextResponse {
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

/**
 * Framing-preview endpoint (docs/ADR-UX-FRAMING-PREVIEW.md). Pipeline:
 * independent rate limit -> strict parse -> classifyIntake (the SAME
 * rule-based, LLM-free classifier as /api/readings) -> crisis gate (same
 * single-source resources) -> safe framing presenter -> exact schema
 * response.
 *
 * Deliberately NOT here: any provider/model call, any Reading Engine call,
 * any seed, any card. The preview never draws and its result is never a
 * bypass token - /api/readings re-runs its own crisis gate on its own body
 * (R6/R8/R9).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const start = performance.now();
  const requestId = getOrCreateRequestId(request.headers);

  if (isRateLimitEnabled()) {
    const decision = limiter.check(clientKey(request.headers));
    if (!decision.allowed) {
      logPreview({ requestId, status: 429, latencyMs: performance.now() - start, outcome: 'rate-limited' });
      const res = NextResponse.json(
        { error: 'rate_limited', message: 'Çok fazla istek. Lütfen biraz sonra tekrar deneyin.' },
        { status: 429 },
      );
      res.headers.set('retry-after', String(Math.ceil(decision.resetInMs / 1000)));
      return withRequestId(res, requestId);
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logPreview({ requestId, status: 400, latencyMs: performance.now() - start, outcome: 'invalid' });
    return withRequestId(NextResponse.json({ error: 'invalid_json_body' }, { status: 400 }), requestId);
  }

  // STRICT: unknown keys (a smuggled persona/safetyFlags/seed) are rejected.
  const parsed = PreviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    logPreview({ requestId, status: 400, latencyMs: performance.now() - start, outcome: 'invalid' });
    return withRequestId(
      NextResponse.json({ error: 'invalid_request', details: parsed.error.issues }, { status: 400 }),
      requestId,
    );
  }

  const { question, topicHint } = parsed.data;

  // Server-computed, always - same rule-based classifier, no LLM.
  const intake = classifyIntake({ questionText: question, topicHint });

  if (intake.safetyFlags.some(isCrisisFlag)) {
    // Crisis gate BEFORE any framing is built - no framing, no cards, no seed.
    const crisisResponse = CrisisResponseSchema.parse({
      status: 'crisis',
      message: CRISIS_MESSAGE,
      resources: CRISIS_RESOURCES,
    });
    logPreview({
      requestId,
      status: 200,
      latencyMs: performance.now() - start,
      outcome: 'crisis',
      safetyFlagCount: intake.safetyFlags.length,
    });
    return withRequestId(NextResponse.json(crisisResponse, { status: 200 }), requestId);
  }

  // Safe, human-readable framing only - the schema shape forbids any leak.
  const response = FramingPreviewResponseSchema.parse({
    status: 'preview',
    framing: presentFraming(intake),
  });

  logPreview({
    requestId,
    status: 200,
    latencyMs: performance.now() - start,
    outcome: 'preview',
    questionDomain: intake.questionDomain,
    safetyFlagCount: intake.safetyFlags.length,
  });

  return withRequestId(NextResponse.json(response, { status: 200 }), requestId);
}
