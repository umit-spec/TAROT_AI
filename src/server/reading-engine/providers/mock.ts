import { Persona } from '../../../types/intake';
import { CardNarration, InterpretationInput, InterpretationOutput } from '../../../types/interpretation';
import { InterpretationProvider } from './types';
import { UNCERTAINTY_NOTICE } from './shared';

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

  async generate(input: InterpretationInput): Promise<InterpretationOutput> {
    const { reading, intake } = input;

    const cards: CardNarration[] = reading.interpretations.map((interp) => ({
      cardId: interp.cardId,
      position: interp.position,
      symbolicMeaning: interp.symbolicMeaning,
      relevanceToQuestion: interp.contextMeaning,
      reflection: interp.reflection,
    }));

    return {
      opening: OPENING_BY_PERSONA[intake.persona],
      cards,
      patterns: reading.patterns,
      practicalReflection:
        'Bu kartların hangisi şu anki durumunuza en çok dokunuyor, ona odaklanabilirsiniz.',
      uncertaintyNotice: UNCERTAINTY_NOTICE,
      safetyFlags: [],
    };
  }
}
