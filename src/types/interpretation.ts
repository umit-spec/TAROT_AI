import { z } from 'zod';
import { CardPositionKeySchema } from './card';
import { DeterministicReadingSchema } from './reading';

// The 5 personas from docs/AŞAMA_2_PERSONA_WIREFRAME_PATHS.md
export const PersonaSchema = z.enum(['first_timer', 'regular', 'anxious', 'decision_maker', 'skeptic']);
export type Persona = z.infer<typeof PersonaSchema>;

/**
 * What every InterpretationProvider receives. This is deliberately just the
 * Layer 1+2 output (ADR-011: steps 1-6) plus persona - a provider has no
 * access to anything a provider shouldn't be able to invent from. Swapping
 * providers must never change what a reading means, only how it reads.
 */
export const InterpretationInputSchema = z.object({
  reading: DeterministicReadingSchema,
  persona: PersonaSchema,
});
export type InterpretationInput = z.infer<typeof InterpretationInputSchema>;

// Per-card narration, matching the ReadingResult.cards shape from
// docs/MVP_PLAN_REVISED.md Aşama 7 (relevanceToQuestion pending a real
// question/intake input - Sprint 2 fills it from contextMeaning until the
// Intake Engine supplies an actual user question).
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
