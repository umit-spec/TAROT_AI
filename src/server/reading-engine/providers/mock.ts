import { Persona } from '../../../types/intake';
import { CardNarration, InterpretationInput, RawInterpretationOutput } from '../../../types/interpretation';
import { InterpretationProvider } from './types';
import { REFLECTION_PROMPT_FALLBACK, UNCERTAINTY_NOTICE } from './shared';

// Minimal persona-tone hook, not the full AŞAMA_2_PERSONA_WIREFRAME_PATHS.md
// depth/word-count spec (that's UX work for Sprint 2/3's intake+display
// screens). This exists only to prove the provider boundary actually
// threads persona through, deterministically, without a network call.
const OPENING_BY_PERSONA: Record<Persona, string> = {
  'reflection-seeking': 'Bu üç kart, sorunuza dair şu anki durumu birlikte anlamamıza yardımcı olacak.',
  'decision-seeking': 'Kartlar, önünüzdeki kararla ilgili şu üç açıyı öne çıkarıyor.',
  'emotionally-overwhelmed': 'Bu kartlar bir kesinlik değil, şu anda elinizde olan seçenekleri gösteriyor.',
  'curious-explorer': 'Üç kart çektik - bunların ne anlama gelebileceğine birlikte bakalım.',
  'experienced-practitioner': 'Üç kart, geçmiş-şimdi-gelecek ekseninde şu desenleri gösteriyor.',
};

/**
 * Deterministic, no-network provider. Same input -> byte-identical output,
 * every time - used for tests and as the Claude-unavailable fallback path
 * (docs/06-READING_CONSTITUTION.md fallback mode).
 */
export class MockProvider implements InterpretationProvider {
  readonly name = 'mock';
  // H4: no network call, no cost. Explicitly free so the deterministic
  // fallback stays available even when the spend gate is closed.
  readonly isFree = true;
  // No prompt concept at all (no LLM call) - explicit undefined, not just
  // omitted, so callers can rely on the property existing on this class.
  readonly promptVersion: string | undefined = undefined;

  async generate(input: InterpretationInput): Promise<RawInterpretationOutput> {
    const { reading, intake, knowledge } = input;

    const cards: CardNarration[] = reading.interpretations.map((interp) => ({
      cardId: interp.cardId,
      position: interp.position,
      symbolicMeaning: interp.symbolicMeaning,
      relevanceToQuestion: interp.contextMeaning,
      reflection: interp.reflection,
    }));

    // Ground truth only - semanticEffect strings come from the resolved
    // KnowledgeContext (ADR-012), never invented here. An empty
    // pairRelations list (no relation authored for these two adjacent
    // cards yet) simply contributes nothing, same as Layer 2's pattern
    // detection contributing nothing when no theme repeats.
    const relationPatterns = knowledge.pairRelations.flatMap((rel) => rel.semanticEffect);

    return {
      opening: OPENING_BY_PERSONA[intake.persona],
      cards,
      patterns: [...reading.patterns, ...relationPatterns],
      practicalReflection:
        'Bu kartların hangisi şu anki durumunuza en çok dokunuyor, ona odaklanabilirsiniz.',
      reflectionPrompt: REFLECTION_PROMPT_FALLBACK,
      uncertaintyNotice: UNCERTAINTY_NOTICE,
      safetyFlags: [],
    };
  }
}
