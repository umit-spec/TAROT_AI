import { NextRequest, NextResponse } from 'next/server';
import { classifyIntake, isCrisisFlag } from '../../../server/intake';
import { CRISIS_MESSAGE, resourcesForSubtypes } from '../../../server/intake/crisis-resources';
import {
  ClaudeProvider,
  DECK_ALGORITHM_VERSION,
  DECK_DATA_VERSION,
  generateInterpretedReading,
} from '../../../server/reading-engine';
import { CrisisResponseSchema, ReadingRequestSchema, ReadingResponseSchema } from '../../../types/api';
import { REQUEST_ID_HEADER, getOrCreateRequestId } from '../../../server/observability/request-id';
import { logReading } from '../../../server/observability/log';
import {
  RateLimiter,
  clientKey,
  isRateLimitEnabled,
  rateLimitPerMinute,
} from '../../../server/observability/rate-limit';

// Module-scoped limiter (per instance - see rate-limit.ts note on the durable
// store deferred to S4). Window is one minute.
const limiter = new RateLimiter(rateLimitPerMinute(), 60_000);

function withRequestId(response: NextResponse, requestId: string): NextResponse {
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

/**
 * The single product endpoint (Sprint 3 plan, §1.5). Pipeline:
 * validate request -> classifyIntake() (server-side, always - never trust
 * client-supplied intake fields) -> crisis gate (the one place in the
 * whole system that refuses to generate at all) -> generateInterpretedReading()
 * (Reading Engine + Knowledge Layer + narration provider, all already
 * covered by their own fallback/validation guarantees).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const start = performance.now();
  const requestId = getOrCreateRequestId(request.headers);

  // Abuse-prevention rate limit (OFF in dev/test; ON in production or when
  // RATE_LIMIT_ENABLED=1). Never inspects request body.
  if (isRateLimitEnabled()) {
    const decision = limiter.check(clientKey(request.headers));
    if (!decision.allowed) {
      logReading({ requestId, status: 429, latencyMs: performance.now() - start, outcome: 'rate-limited' });
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
    logReading({ requestId, status: 400, latencyMs: performance.now() - start, outcome: 'invalid' });
    return withRequestId(NextResponse.json({ error: 'invalid_json_body' }, { status: 400 }), requestId);
  }

  const parsed = ReadingRequestSchema.safeParse(body);
  if (!parsed.success) {
    logReading({ requestId, status: 400, latencyMs: performance.now() - start, outcome: 'invalid' });
    return withRequestId(
      NextResponse.json({ error: 'invalid_request', details: parsed.error.issues }, { status: 400 }),
      requestId,
    );
  }

  const { seed, question, topicHint } = parsed.data;

  // Server-computed, always - the request schema has no persona/confidence/
  // safetyFlags fields to trust in the first place (types/api.ts).
  const intake = classifyIntake({ questionText: question, topicHint });

  if (intake.safetyFlags.some(isCrisisFlag)) {
    // No draw, no provider call, no tarot reading - docs/02-ETHICAL_CONSTITUTION.md
    // Response Flow: PAUSE, acknowledge, resources, nothing else.
    // H2: resources selected by detected subtype, not one uniform list.
    // Falls back to the always-applicable emergency line, so the screen can
    // never render without a way to get help.
    const crisisResponse = CrisisResponseSchema.parse({
      status: 'crisis',
      message: CRISIS_MESSAGE,
      resources: resourcesForSubtypes(intake.safetyFlags.filter(isCrisisFlag)),
    });
    // Crisis text is NOT logged (D4) - only that a crisis short-circuit occurred.
    logReading({
      requestId,
      status: 200,
      latencyMs: performance.now() - start,
      outcome: 'crisis',
      crisis: true,
      safetyFlagCount: intake.safetyFlags.length,
    });
    return withRequestId(NextResponse.json(crisisResponse, { status: 200 }), requestId);
  }

  const provider = new ClaudeProvider();
  const { reading, output, providerUsed, promptVersionUsed, knowledge, usage, fallbackReason } =
    await generateInterpretedReading({
      seed,
      spread: 'three-card',
      intake,
      questionText: question,
      provider,
    });

  const response = ReadingResponseSchema.parse({
    readingId: null, // persistence is Sprint 4+ (Sprint 3 plan §5)
    seed: reading.seed,
    cards: reading.cards,
    intakeContext: intake,
    knowledge,
    interpretation: output,
    provider: providerUsed,
    versions: {
      deck: DECK_DATA_VERSION,
      algorithm: DECK_ALGORITHM_VERSION,
      knowledge: knowledge.meta.version,
      prompt: promptVersionUsed ?? 'n/a',
    },
  });

  // Structured, redacted log: derived signals only, never question text (D4/D5).
  logReading({
    requestId,
    status: 200,
    latencyMs: performance.now() - start,
    outcome: 'reading',
    persona: intake.persona,
    questionDomain: intake.questionDomain,
    crisis: false,
    safetyFlagCount: intake.safetyFlags.length,
    provider: providerUsed,
    fallbackReason,
    inputTokens: usage?.inputTokens,
    outputTokens: usage?.outputTokens,
  });

  return withRequestId(NextResponse.json(response, { status: 200 }), requestId);
}
