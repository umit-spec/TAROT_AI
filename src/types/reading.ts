import { z } from 'zod';
import { CardContextKeySchema, CardPositionKeySchema } from './card';

export const OrientationSchema = z.literal('upright');
// ADR-002: Reversed Cards Excluded from MVP. The field stays in the schema
// (data model ready for future) but Sprint 1 output is always upright.
export type Orientation = z.infer<typeof OrientationSchema>;

export const SpreadTypeSchema = z.enum(['three-card']);
export type SpreadType = z.infer<typeof SpreadTypeSchema>;

export const DrawnCardSchema = z.object({
  id: z.string(),
  position: CardPositionKeySchema,
  orientation: OrientationSchema,
});
export type DrawnCard = z.infer<typeof DrawnCardSchema>;

export const CardInterpretationSchema = z.object({
  cardId: z.string(),
  position: CardPositionKeySchema,
  symbolicMeaning: z.string(),
  positionMeaning: z.string(),
  contextMeaning: z.string(),
  reflection: z.string(),
});
export type CardInterpretation = z.infer<typeof CardInterpretationSchema>;

// Layer 1 + Layer 2 output (deterministic, no AI). Layer 3 (Claude language
// rewrite, per ADR-004) is out of Sprint 1 scope and wraps this later.
export const DeterministicReadingSchema = z.object({
  seed: z.string().min(1),
  spread: SpreadTypeSchema,
  topic: CardContextKeySchema,
  cards: z.array(DrawnCardSchema).length(3),
  interpretations: z.array(CardInterpretationSchema).length(3),
  patterns: z.array(z.string()),
});
export type DeterministicReading = z.infer<typeof DeterministicReadingSchema>;
