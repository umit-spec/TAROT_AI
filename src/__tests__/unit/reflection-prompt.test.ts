import { describe, expect, test } from 'vitest';
import { generateInterpretedReading, MockProvider } from '../../server/reading-engine';
import { InterpretationProvider } from '../../server/reading-engine/providers/types';
import { REFLECTION_PROMPT_FALLBACK } from '../../server/reading-engine/providers/shared';
import { resolveReflectionPrompt, validateReflectionPrompt } from '../../server/reading-engine/validate';
import { InterpretationInput, RawInterpretationOutput } from '../../types/interpretation';
import { testIntake } from '../helpers/intake';

const SAFE = [
  'Bu durumda kendi ihtiyacını daha açık ifade etmek için neye dikkat edebilirsin?',
  'Şu anda kontrol edebildiğin en küçük adım ne olabilir?',
  'Bu örüntü sana hangi sınırını yeniden düşünmen gerektiğini gösteriyor?',
  REFLECTION_PROMPT_FALLBACK,
];

const FORBIDDEN = [
  'O sana geri dönecek mi?', // prediction + third party
  'Patronun seni kıskandığı için mi böyle davranıyor?', // third-party certainty
  'Bu kartlar depresyonda olduğunu mu gösteriyor?', // diagnosis
  'Yarın hangi kararı vermelisin?', // prediction + imperative
];

describe('validateReflectionPrompt — accepts only one safe reflective question', () => {
  test.each(SAFE)('accepts a safe prompt: %s', (prompt) => {
    expect(validateReflectionPrompt(prompt)).not.toBeNull();
  });

  test.each(FORBIDDEN)('rejects an unsafe prompt: %s', (prompt) => {
    expect(validateReflectionPrompt(prompt)).toBeNull();
  });

  test('rejects too short / too long', () => {
    expect(validateReflectionPrompt('Ne düşünürsün?')).toBeNull(); // < 20
    expect(validateReflectionPrompt('A'.repeat(230) + '?')).toBeNull(); // > 220
  });

  test('requires exactly one question mark, ending the text', () => {
    expect(validateReflectionPrompt('Bu ne, şu ne olabilir acaba düşün?')).not.toBeNull();
    expect(validateReflectionPrompt('Bu ne olabilir? Peki şu ne olabilir?')).toBeNull(); // two ?
    expect(validateReflectionPrompt('Bunu düşün ve devam et lütfen bakalım.')).toBeNull(); // no ?
    expect(validateReflectionPrompt('Bunu neden? düşünmelisin diye devam et.')).toBeNull(); // ? not at end
  });

  test('rejects multi-line and list-shaped prompts', () => {
    expect(validateReflectionPrompt('Birinci düşünce ne olabilir sence?\nİkincisi?')).toBeNull();
    expect(validateReflectionPrompt('- İlk düşünce ne olabilir bugün sence?')).toBeNull();
  });

  test('normalizes surrounding/collapsed whitespace on an accepted prompt', () => {
    const out = validateReflectionPrompt('  Şu anda   kontrol edebildiğin en küçük adım ne olabilir?  ');
    expect(out).toBe('Şu anda kontrol edebildiğin en küçük adım ne olabilir?');
  });
});

describe('resolveReflectionPrompt — categorical source, central fallback', () => {
  test('valid provider prompt -> provider source, prompt kept', () => {
    const r = resolveReflectionPrompt({ reflectionPrompt: SAFE[0] } as RawInterpretationOutput);
    expect(r.source).toBe('provider');
    expect(r.reflectionPrompt).toBe(SAFE[0]);
  });

  test('invalid/missing prompt -> fallback source, central fallback used', () => {
    expect(resolveReflectionPrompt({ reflectionPrompt: FORBIDDEN[0] } as RawInterpretationOutput)).toEqual({
      reflectionPrompt: REFLECTION_PROMPT_FALLBACK,
      source: 'fallback',
    });
    expect(resolveReflectionPrompt({} as RawInterpretationOutput)).toEqual({
      reflectionPrompt: REFLECTION_PROMPT_FALLBACK,
      source: 'fallback',
    });
  });
});

// A provider whose reading is fine EXCEPT its reflection prompt is unsafe.
class BadReflectionProvider implements InterpretationProvider {
  readonly name = 'bad-reflection-provider';
  async generate(input: InterpretationInput): Promise<RawInterpretationOutput> {
    const mock = await new MockProvider().generate(input);
    return { ...mock, reflectionPrompt: 'O sana geri dönecek mi?' };
  }
}

class GoodReflectionProvider implements InterpretationProvider {
  readonly name = 'good-reflection-provider';
  async generate(input: InterpretationInput): Promise<RawInterpretationOutput> {
    const mock = await new MockProvider().generate(input);
    return { ...mock, reflectionPrompt: 'Bu durumda kendi ihtiyacını daha açık görmek için neye bakabilirsin?' };
  }
}

describe('field-level fallback (A2) — a bad prompt does not nuke the whole reading', () => {
  test('an unsafe reflectionPrompt is replaced field-level; the provider still runs', async () => {
    const { output, providerUsed, fallbackReason, reflectionPromptSource } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new BadReflectionProvider(),
    });
    // Field-level: the provider ran (NOT a whole-reading fallback to mock)...
    expect(providerUsed).toBe('bad-reflection-provider');
    expect(fallbackReason).toBeUndefined();
    // ...but the reflection prompt is the governed fallback, categorically flagged.
    expect(output.reflectionPrompt).toBe(REFLECTION_PROMPT_FALLBACK);
    expect(reflectionPromptSource).toBe('fallback');
    // The rest of the reading is preserved.
    expect(output.opening.length).toBeGreaterThan(0);
    expect(output.cards).toHaveLength(3);
  });

  test('a safe provider prompt is preserved and flagged as provider source', async () => {
    const { output, reflectionPromptSource } = await generateInterpretedReading({
      seed: 'demo-001',
      spread: 'three-card',
      intake: testIntake(),
      provider: new GoodReflectionProvider(),
    });
    expect(output.reflectionPrompt).toBe('Bu durumda kendi ihtiyacını daha açık görmek için neye bakabilirsin?');
    expect(reflectionPromptSource).toBe('provider');
  });
});
