export type CardDisplayMeta = {
  cardId: string;
  displayName: string;
  arcana: 'major' | 'minor';
};

/**
 * Governed card display-name registry (docs/CARD_NAME_REGISTRY.md).
 *
 * PRESENTATION LAYER ONLY. `cardId` remains the single authority for identity
 * and order; this registry only maps an id to the Turkish name shown to the
 * user. It authors no card meaning, symbol, interpretation, or new text.
 *
 * The `displayName` values are sourced verbatim from the governed card data
 * (`data/cards/*.json` `name_tr`) - NOT a free re-translation - and a test
 * (`card-display.test.ts`) locks this map to that data so the two can never
 * drift. Client-safe (a plain static map, no `fs`), because the reveal/reading
 * components are client components and the API response is unchanged.
 */
export const CARD_DISPLAY_REGISTRY: Record<string, CardDisplayMeta> = {
  '00-fool': { cardId: '00-fool', displayName: 'Deli', arcana: 'major' },
  '01-magician': { cardId: '01-magician', displayName: 'Büyücü', arcana: 'major' },
  '02-high-priestess': { cardId: '02-high-priestess', displayName: 'Yüksek Rahibe', arcana: 'major' },
  '03-empress': { cardId: '03-empress', displayName: 'İmparatoriçe', arcana: 'major' },
  '04-emperor': { cardId: '04-emperor', displayName: 'İmparator', arcana: 'major' },
  '05-hierophant': { cardId: '05-hierophant', displayName: 'Hiyerofant', arcana: 'major' },
  '06-lovers': { cardId: '06-lovers', displayName: 'Âşıklar', arcana: 'major' },
  '07-chariot': { cardId: '07-chariot', displayName: 'Savaş Arabası', arcana: 'major' },
  '08-strength': { cardId: '08-strength', displayName: 'Güç', arcana: 'major' },
  '09-hermit': { cardId: '09-hermit', displayName: 'Ermiş', arcana: 'major' },
  '10-wheel-of-fortune': { cardId: '10-wheel-of-fortune', displayName: 'Kaderin Tekerleği', arcana: 'major' },
  '11-justice': { cardId: '11-justice', displayName: 'Adalet', arcana: 'major' },
  '12-hanged-man': { cardId: '12-hanged-man', displayName: 'Asılı Adam', arcana: 'major' },
  '13-death': { cardId: '13-death', displayName: 'Ölüm', arcana: 'major' },
  '14-temperance': { cardId: '14-temperance', displayName: 'Denge', arcana: 'major' },
  '15-devil': { cardId: '15-devil', displayName: 'Şeytan', arcana: 'major' },
  '16-tower': { cardId: '16-tower', displayName: 'Kule', arcana: 'major' },
  '17-star': { cardId: '17-star', displayName: 'Yıldız', arcana: 'major' },
  '18-moon': { cardId: '18-moon', displayName: 'Ay', arcana: 'major' },
  '19-sun': { cardId: '19-sun', displayName: 'Güneş', arcana: 'major' },
  '20-judgement': { cardId: '20-judgement', displayName: 'Yargı', arcana: 'major' },
  '21-world': { cardId: '21-world', displayName: 'Dünya', arcana: 'major' },
};

/** Safe fallback for an unknown id - the raw `cardId` is never shown to users. */
export const CARD_DISPLAY_FALLBACK = 'Kart';

/**
 * The user-facing card name for a `cardId`. Never returns the raw id: an
 * unmapped id yields the neutral governed fallback, never invented text.
 */
export function cardDisplayName(cardId: string): string {
  return CARD_DISPLAY_REGISTRY[cardId]?.displayName ?? CARD_DISPLAY_FALLBACK;
}
