import { NextRequest, NextResponse } from 'next/server';
import { classifyIntake, isCrisisFlag } from '../../../server/intake';
import {
  ClaudeProvider,
  DECK_ALGORITHM_VERSION,
  DECK_DATA_VERSION,
  generateInterpretedReading,
} from '../../../server/reading-engine';
import { CrisisResponseSchema, ReadingRequestSchema, ReadingResponseSchema } from '../../../types/api';

// docs/02-ETHICAL_CONSTITUTION.md Crisis Resources (Türkiye).
const CRISIS_RESOURCES = [
  { label: 'İntihar Önleme Derneği Çağrı Hattı', contact: '0312 380 9098' },
  { label: 'ALO 183 - Çocuk İhbar Hattı', contact: '183' },
  { label: 'Polis İmdat', contact: '155' },
  { label: 'Acil Tıp', contact: '112' },
];

/**
 * The single product endpoint (Sprint 3 plan, §1.5). Pipeline:
 * validate request -> classifyIntake() (server-side, always - never trust
 * client-supplied intake fields) -> crisis gate (the one place in the
 * whole system that refuses to generate at all) -> generateInterpretedReading()
 * (Reading Engine + Knowledge Layer + narration provider, all already
 * covered by their own fallback/validation guarantees).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json_body' }, { status: 400 });
  }

  const parsed = ReadingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request', details: parsed.error.issues }, { status: 400 });
  }

  const { seed, question, topicHint } = parsed.data;

  // Server-computed, always - the request schema has no persona/confidence/
  // safetyFlags fields to trust in the first place (types/api.ts).
  const intake = classifyIntake({ questionText: question, topicHint });

  if (intake.safetyFlags.some(isCrisisFlag)) {
    // No draw, no provider call, no tarot reading - docs/02-ETHICAL_CONSTITUTION.md
    // Response Flow: PAUSE, acknowledge, resources, nothing else.
    const crisisResponse = CrisisResponseSchema.parse({
      status: 'crisis',
      message: 'Bu zor bir durum olabilir. Yalnız değilsiniz - profesyonel destek almanız önemli.',
      resources: CRISIS_RESOURCES,
    });
    return NextResponse.json(crisisResponse, { status: 200 });
  }

  const provider = new ClaudeProvider();
  const { reading, output, providerUsed, promptVersionUsed, knowledge } = await generateInterpretedReading({
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

  return NextResponse.json(response, { status: 200 });
}
