import { IntakeContext, IntakeContextSchema } from '../../types/intake';

export function testIntake(overrides: Partial<IntakeContext> = {}): IntakeContext {
  return IntakeContextSchema.parse({
    questionDomain: 'general',
    persona: 'reflection-seeking',
    emotionalIntensity: 'low',
    decisionUrgency: 'low',
    spiritualPreference: 'balanced',
    responseDepth: 'standard',
    safetyFlags: [],
    confidence: 0.2,
    ...overrides,
  });
}
