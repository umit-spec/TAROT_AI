import { Persona, SpiritualPreference } from '../types/intake';

/**
 * Resolves docs/UX_DEBT_LOG.md UX-DEBT-001: maps the wireframe's 5
 * enduring-user-type archetypes (docs/AŞAMA_2_PERSONA_WIREFRAME_PATHS.md)
 * to the Intake Engine's session-scoped Persona taxonomy
 * (src/types/intake.ts). They are deliberately different lists - this is
 * the one place the mapping is defined and tested, so it can't drift.
 *
 * "Curious Skeptic" is the one wireframe archetype that doesn't map to a
 * single Persona value - see resolvePersonaProfile() below.
 */
export interface PersonaProfile {
  persona: Persona;
  wireframeArchetype: string;
  /** A short, UI-visible framing label - the one place this mapping
   * produces something rendered, not just documented. */
  framingLabel: string;
}

const BASE_PROFILES: Record<Persona, Omit<PersonaProfile, 'persona'>> = {
  'curious-explorer': {
    wireframeArchetype: 'First-Time User',
    framingLabel: 'Yeni bir keşif olarak',
  },
  'experienced-practitioner': {
    wireframeArchetype: 'Regular Practitioner',
    framingLabel: 'Deneyiminize uygun bir derinlikte',
  },
  'emotionally-overwhelmed': {
    wireframeArchetype: 'Highly Anxious User',
    framingLabel: 'Yumuşak ve destekleyici bir çerçevede',
  },
  'decision-seeking': {
    wireframeArchetype: 'Decision-Maker',
    framingLabel: 'Kararınıza odaklı, net bir çerçevede',
  },
  'reflection-seeking': {
    wireframeArchetype: 'Curious Skeptic (default framing) / general reflection',
    framingLabel: 'Açık uçlu bir yansıtma olarak',
  },
};

/**
 * The wireframe's "Curious Skeptic" was never really its own persona - it
 * conflated a persona axis with a symbolic-vs-psychological framing axis
 * that IntakeContext already separates (persona + spiritualPreference).
 * reflection-seeking + psychological IS Curious Skeptic; reflection-seeking
 * + anything else is plain open-ended reflection. This function is the one
 * place that distinction is visible - see the framingLabel override below.
 */
export function resolvePersonaProfile(persona: Persona, spiritualPreference: SpiritualPreference): PersonaProfile {
  if (persona === 'reflection-seeking' && spiritualPreference === 'psychological') {
    return {
      persona,
      wireframeArchetype: 'Curious Skeptic',
      framingLabel: 'Psikolojik bir mercekle, kehanet değil',
    };
  }
  return { persona, ...BASE_PROFILES[persona] };
}
