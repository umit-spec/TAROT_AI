/**
 * Turkish-aware text normalization and matching (H2).
 *
 * Replaces the substring `includes()` scan that H1 could only partially patch.
 * Everything here is deterministic and dependency-free: no tokenizer package,
 * no morphological analyser, no model. A reviewer can read every rule.
 *
 * ---
 *
 * WHY A DEDICATED MODULE
 *
 * Three Turkish-specific facts break naive JavaScript string matching, and all
 * three were measured as real defects in this repo:
 *
 * 1. CASE. JavaScript's `String.prototype.toLowerCase()` is not Turkish-aware.
 *    'İ'.toLowerCase() yields 'i' + U+0307 (a combining dot), not 'i'. That is
 *    why "BU KESİNLİKLE OLACAK" slipped past the output scanner: the folded
 *    text never equalled the folded keyword.
 *
 * 2. DIACRITICS. Turkish users routinely type without Turkish characters
 *    ("dusunuyorum" for "düşünüyorum"), especially on foreign keyboards. A
 *    matcher that only knows the accented form misses those entirely.
 *
 * 3. AGGLUTINATION. Turkish attaches suffixes to stems, so "intihar" appears
 *    as "intiharı", "intiharı", "intihardan". A word-boundary regex under-
 *    matches; a prefix match over-matches ('zorla' inside "zorlanıyorum",
 *    which produced the sexual-assault false positives). The compromise here
 *    is a suffix WHITELIST: a stem may be followed only by known inflectional
 *    endings, never by an arbitrary continuation.
 */

/**
 * Turkish-aware case fold.
 *
 * Order matters: the dotted/dotless I pairs are mapped explicitly BEFORE the
 * generic lowercase, because the generic pass is exactly what corrupts them.
 * After this function, 'İ' and 'I' are 'i' and 'ı' respectively, with no
 * stray combining marks anywhere.
 */
export function foldCase(input: string): string {
  return input
    .normalize('NFC')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    // Defensive: strip any combining dot a non-NFC source may still carry.
    .replace(/̇/g, '')
    .normalize('NFC');
}

/**
 * Fold Turkish letters to their ASCII skeletons, so an un-accented typing
 * style matches the accented keyword. Applied to BOTH sides of a comparison,
 * never to text that will be shown to a user.
 */
export function foldDiacritics(input: string): string {
  return input
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u');
}

/** Full normalization used for all matching: NFC, Turkish fold, ASCII fold. */
export function normalizeForMatch(input: string): string {
  return foldDiacritics(foldCase(input));
}

/**
 * Split into word tokens on anything that is not a Unicode letter or digit.
 *
 * Deliberately drops punctuation rather than keeping it, so obfuscation by
 * inserted punctuation ("i.n.t.i.h.a.r") collapses toward the plain form when
 * `collapseSeparators` is used by the caller.
 */
export function tokenize(input: string): string[] {
  return normalizeForMatch(input)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 0);
}

/**
 * Inflectional suffixes a stem may carry and still be the same word.
 *
 * DELIBERATELY EXCLUDES derivational consonants (-n-, -l-, -r-, -t-) that
 * build a NEW verb from a stem. That exclusion is the whole reason 'zorla'
 * ("by force") no longer matches "zorlanıyorum" ("I am struggling"): the
 * remainder "nıyorum" begins with a derivational -n- and is not on this list.
 *
 * Ordered longest-first so the greedy check below cannot stop early on a
 * shorter prefix of a longer suffix.
 */
const INFLECTIONAL_SUFFIXES = [
  // Verbal
  'iyorum', 'iyorsun', 'iyor', 'acagim', 'ecegim', 'acak', 'ecek',
  'mistim', 'mustum', 'dim', 'dim', 'dum', 'tim', 'tum', 'di', 'du', 'ti', 'tu',
  'mak', 'mek', 'mayi', 'meyi', 'maya', 'meye', 'masi', 'mesi', 'ma', 'me',
  // Nominal: case, possessive, plural
  'larindan', 'lerinden', 'larimiz', 'lerimiz', 'larim', 'lerim',
  'lardan', 'lerden', 'larda', 'lerde', 'lari', 'leri', 'lar', 'ler',
  'imiz', 'iniz', 'dan', 'den', 'tan', 'ten', 'nin', 'nun', 'in', 'un',
  'yla', 'yle', 'la', 'le', 'da', 'de', 'ta', 'te', 'ya', 'ye',
  'im', 'um', 'i', 'u', 'a', 'e',
  // NOT listed, deliberately: bare 'n' and 'm'. Both are derivational in
  // Turkish (passive/reflexive -n-, verbal noun -m), and allowing them
  // re-opens exactly the defect this whitelist exists to close:
  //   'zorla' + 'n' + 'iyorum' would reconstruct "zorlanıyorum"
  //   'zorla' + 'ma' + 'm'     would reconstruct "zorlamam"
  // Inflected forms that genuinely need a final -n or -m are reachable
  // through the longer entries above ('in', 'un', 'im', 'um').
]
  .filter((s, i, all) => all.indexOf(s) === i)
  .sort((a, b) => b.length - a.length);

/**
 * True when `token` is `stem` optionally followed by a whitelisted chain of
 * inflectional suffixes (at most two, which covers ordinary Turkish without
 * letting an arbitrary tail through).
 */
function isStemWithSuffix(token: string, stem: string): boolean {
  if (token === stem) return true;
  if (!token.startsWith(stem)) return false;

  let rest = token.slice(stem.length);
  for (let depth = 0; depth < 2 && rest.length > 0; depth++) {
    const suffix = INFLECTIONAL_SUFFIXES.find((s) => rest.startsWith(s));
    if (!suffix) return false;
    rest = rest.slice(suffix.length);
  }
  return rest.length === 0;
}

/**
 * Levenshtein distance, capped for early exit. Used ONLY for bounded typo
 * tolerance on long tokens - see `tokenMatches`.
 */
export function editDistance(a: string, b: string, max = 1): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (a === b) return 0;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const v = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      curr.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev = curr;
  }
  return prev[b.length];
}

export interface TokenMatchOptions {
  /** Permit whitelisted Turkish inflectional suffixes on the stem. */
  allowSuffix?: boolean;
  /**
   * Permit ONE character of typo on tokens of at least MIN_FUZZY_LENGTH.
   * Off by default: fuzzy matching on short tokens is a false-positive engine.
   */
  fuzzy?: boolean;
}

/**
 * Minimum stem length for typo tolerance. Below this, a single edit can turn
 * one ordinary Turkish word into another entirely ("bak"/"bal"/"bar"), so
 * fuzzy matching is refused rather than risked.
 */
export const MIN_FUZZY_LENGTH = 5;

export function tokenMatches(token: string, stem: string, opts: TokenMatchOptions = {}): boolean {
  const { allowSuffix = true, fuzzy = false } = opts;

  if (token === stem) return true;
  if (allowSuffix && isStemWithSuffix(token, stem)) return true;

  if (fuzzy && stem.length >= MIN_FUZZY_LENGTH) {
    // Compare against the token itself, and against the token truncated to the
    // stem length, so a typo inside an inflected form ("zrarını") is still
    // reachable without letting the suffix inflate the distance.
    if (editDistance(token, stem, 1) <= 1) return true;
    if (token.length > stem.length && editDistance(token.slice(0, stem.length), stem, 1) <= 1) {
      return true;
    }
  }

  return false;
}

/**
 * Find a phrase (given as a token array) inside a token array.
 *
 * Returns the index of the first match, or -1. Matching is positional and
 * contiguous: "kendime zarar" matches "kendime zarar vermek" but not
 * "kendime bir şey zarar".
 */
export function findPhrase(
  tokens: readonly string[],
  phrase: readonly string[],
  opts: TokenMatchOptions = {}
): number {
  if (phrase.length === 0 || phrase.length > tokens.length) return -1;

  outer: for (let i = 0; i <= tokens.length - phrase.length; i++) {
    for (let j = 0; j < phrase.length; j++) {
      // Only the FINAL token of a phrase may carry inflection; interior tokens
      // must match exactly, which keeps multi-word phrases tight.
      const isLast = j === phrase.length - 1;
      const tokenOpts: TokenMatchOptions = isLast
        ? opts
        : { allowSuffix: opts.allowSuffix, fuzzy: opts.fuzzy };
      if (!tokenMatches(tokens[i + j], phrase[j], tokenOpts)) continue outer;
    }
    return i;
  }
  return -1;
}

export function containsPhrase(
  tokens: readonly string[],
  phrase: string,
  opts: TokenMatchOptions = {}
): boolean {
  return findPhrase(tokens, tokenize(phrase), opts) !== -1;
}

/**
 * Every separator removed, producing one unbroken run of letters and digits.
 *
 * This is the de-obfuscation view: "k e s i n l i k l e", "kesin-likle", and
 * "k.e.s.i.n.l.i.k.l.e" all collapse to the same string, so a single substring
 * check catches all of them.
 *
 * TRADE-OFF, stated plainly: joining everything can also fuse two innocent
 * neighbouring words into a token that happens to contain a keyword. That is
 * acceptable ONLY where over-detection is cheap - a denylist scan whose
 * penalty is a governed fallback. It must NEVER be the basis for a decision
 * whose false positive is costly, which is why the crisis classifier matches
 * on tokens and uses this view only as a secondary signal.
 */
export function stripSeparators(input: string): string {
  return normalizeForMatch(input).replace(/[^\p{L}\p{N}]+/gu, '');
}

/**
 * Conservative de-obfuscation: joins only runs of single characters separated
 * by spaces/dots/hyphens ("k e s i n l i k l e"), leaving ordinary prose
 * alone. Unlike `stripSeparators` this cannot fuse two whole words.
 */
export function collapseSpacedLetters(input: string): string {
  return input.replace(
    /(?<![\p{L}\p{N}])(?:[\p{L}\p{N}][\s.\-_*]+){2,}[\p{L}\p{N}](?![\p{L}\p{N}])/gu,
    (run) => run.replace(/[\s.\-_*]+/g, '')
  );
}
