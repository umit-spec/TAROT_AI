import { describe, expect, test } from 'vitest';
import { resolvePersonaProfile } from '../../lib/persona-mapping';
import { Persona, SpiritualPreference } from '../../types/intake';

const ALL_PERSONAS: Persona[] = [
  'reflection-seeking',
  'decision-seeking',
  'emotionally-overwhelmed',
  'curious-explorer',
  'experienced-practitioner',
];
const ALL_SPIRITUAL_PREFS: SpiritualPreference[] = ['symbolic', 'psychological', 'balanced'];

describe('resolvePersonaProfile — UX-DEBT-001 closure', () => {
  test('every Persona value resolves to exactly one profile, for every spiritualPreference', () => {
    for (const persona of ALL_PERSONAS) {
      for (const pref of ALL_SPIRITUAL_PREFS) {
        const profile = resolvePersonaProfile(persona, pref);
        expect(profile.persona).toBe(persona);
        expect(profile.wireframeArchetype.length).toBeGreaterThan(0);
        expect(profile.framingLabel.length).toBeGreaterThan(0);
      }
    }
  });

  test('"Curious Skeptic" resolves as reflection-seeking + psychological, distinctly from plain reflection-seeking', () => {
    const skeptic = resolvePersonaProfile('reflection-seeking', 'psychological');
    const plain = resolvePersonaProfile('reflection-seeking', 'balanced');

    expect(skeptic.wireframeArchetype).toBe('Curious Skeptic');
    expect(skeptic.framingLabel).not.toBe(plain.framingLabel);
  });

  test('reflection-seeking + symbolic does not trigger the skeptic resolution', () => {
    const result = resolvePersonaProfile('reflection-seeking', 'symbolic');
    expect(result.wireframeArchetype).not.toBe('Curious Skeptic');
  });

  test('First-Time User maps to curious-explorer', () => {
    const result = resolvePersonaProfile('curious-explorer', 'balanced');
    expect(result.wireframeArchetype).toBe('First-Time User');
  });

  test('Regular Practitioner maps to experienced-practitioner', () => {
    const result = resolvePersonaProfile('experienced-practitioner', 'balanced');
    expect(result.wireframeArchetype).toBe('Regular Practitioner');
  });

  test('Highly Anxious User maps to emotionally-overwhelmed', () => {
    const result = resolvePersonaProfile('emotionally-overwhelmed', 'balanced');
    expect(result.wireframeArchetype).toBe('Highly Anxious User');
  });

  test('Decision-Maker maps to decision-seeking', () => {
    const result = resolvePersonaProfile('decision-seeking', 'balanced');
    expect(result.wireframeArchetype).toBe('Decision-Maker');
  });
});
