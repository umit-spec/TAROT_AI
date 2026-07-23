import { z } from 'zod';

/**
 * Session-scoped context, not an enduring psychological label. The same
 * person can get a different persona on a different day, for a different
 * question - this describes the session, not the user. Deliberately a
 * different, smaller taxonomy than AŞAMA_2_PERSONA_WIREFRAME_PATHS.md's
 * 5 UX archetypes (first-timer/regular/anxious/decision-maker/skeptic):
 * that list describes *user types* for wireframe/copy purposes, this one
 * describes *this session's* framing need and is what actually flows
 * through Intake -> Reading -> narration (ADR-011 step 5). Reconciling the
 * two vocabularies for the wireframe copy is separate, future UX work.
 */
export const PersonaSchema = z.enum([
  'reflection-seeking',
  'decision-seeking',
  'emotionally-overwhelmed',
  'curious-explorer',
  'experienced-practitioner',
]);
export type Persona = z.infer<typeof PersonaSchema>;

/**
 * 'self' and 'general' are deliberately distinct: 'self' is the safe
 * fallback default (no specific external domain detected - a personal/
 * identity-scoped question), 'general' means multiple domains were
 * detected and none dominated. Card data (data/cards/*.json
 * contextualMeanings) only has 3 buckets today (relationship/career/
 * general) - see toCardContext() in rules.ts for the 'self' -> 'general'
 * bridge; adding a real 'self' bucket to card content is out of scope here.
 */
export const QuestionDomainSchema = z.enum(['relationship', 'career', 'self', 'general']);
export type QuestionDomain = z.infer<typeof QuestionDomainSchema>;

export const IntensityLevelSchema = z.enum(['low', 'medium', 'high']);
export type IntensityLevel = z.infer<typeof IntensityLevelSchema>;

export const UrgencyLevelSchema = z.enum(['low', 'medium', 'high']);
export type UrgencyLevel = z.infer<typeof UrgencyLevelSchema>;

export const SpiritualPreferenceSchema = z.enum(['symbolic', 'psychological', 'balanced']);
export type SpiritualPreference = z.infer<typeof SpiritualPreferenceSchema>;

export const ResponseDepthSchema = z.enum(['brief', 'standard', 'deep']);
export type ResponseDepth = z.infer<typeof ResponseDepthSchema>;

export const IntakeRawInputSchema = z.object({
  questionText: z.string().default(''),
  // Optional explicit topic button, if the UI collects one - takes priority
  // over free-text domain inference when present. 'general' isn't offered
  // as a hint (nothing meaningful for a user to explicitly pick there).
  topicHint: z.enum(['relationship', 'career', 'self']).optional(),
});
export type IntakeRawInput = z.infer<typeof IntakeRawInputSchema>;

/**
 * Output of the Intake Engine. No diagnosis, no definitive personality
 * judgment, no LLM call, no interference with card selection - this is
 * pure rule-based classification of session context, consumed by
 * generateInterpretedReading() (persona + domain) and by the caller
 * (safetyFlags - crisis_* flags mean the caller must not deliver a
 * reading; the Intake Engine only classifies, it does not gate).
 */
export const IntakeContextSchema = z.object({
  questionDomain: QuestionDomainSchema,
  persona: PersonaSchema,
  emotionalIntensity: IntensityLevelSchema,
  decisionUrgency: UrgencyLevelSchema,
  spiritualPreference: SpiritualPreferenceSchema,
  responseDepth: ResponseDepthSchema,
  safetyFlags: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});
export type IntakeContext = z.infer<typeof IntakeContextSchema>;
