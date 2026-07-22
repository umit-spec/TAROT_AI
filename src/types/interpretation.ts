import { z } from 'zod';
import { CardPositionKeySchema } from './card';
import { IntakeContextSchema, PersonaSchema } from './intake';
import { DeterministicReadingSchema } from './reading';

// Persona is defined once, in ./intake (ADR-011 step 5: it originates at
// intake and flows through to narration unchanged). Re-exported here so
// existing `import { Persona } from '../types/interpretation'` call sites
// keep working.
export { PersonaSchema };
export type { Persona } from './intake';

/**
 * What every InterpretationProvider receives: Layer 1+2 output (ADR-011
 * steps 1-6), the full Intake classification, and - only for providers that
 * need it (Claude) - the raw user question text, carried as an isolated
 * data field, never as something a provider concatenates into its own
 * instructions. A provider has no access to anything it shouldn't be able
 * to invent from; swapping providers must never change what a reading
 * means, only how it reads.
 */
export const InterpretationInputSchema = z.object({
  reading: DeterministicReadingSchema,
  intake: IntakeContextSchema,
  questionText: z.string().default(''),
});
export type InterpretationInput = z.infer<typeof InterpretationInputSchema>;

// Per-card narration, matching the ReadingResult.cards shape from
// docs/MVP_PLAN_REVISED.md Aşama 7.
export const CardNarrationSchema = z.object({
  cardId: z.string(),
  position: CardPositionKeySchema,
  symbolicMeaning: z.string(),
  relevanceToQuestion: z.string(),
  reflection: z.string(),
});
export type CardNarration = z.infer<typeof CardNarrationSchema>;

export const InterpretationOutputSchema = z.object({
  opening: z.string().min(1),
  cards: z.array(CardNarrationSchema).length(3),
  patterns: z.array(z.string()),
  practicalReflection: z.string().min(1),
  uncertaintyNotice: z.string().min(1),
  safetyFlags: z.array(z.string()),
});
export type InterpretationOutput = z.infer<typeof InterpretationOutputSchema>;
