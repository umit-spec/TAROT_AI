/**
 * Turkish-aware lowercase (İ -> i, I -> ı is wrong for our purpose - we
 * want case-insensitive keyword matching, so plain locale lowercasing is
 * what we need, not case folding to ASCII).
 */
export function normalize(text: string): string {
  return text.toLocaleLowerCase('tr').trim();
}
