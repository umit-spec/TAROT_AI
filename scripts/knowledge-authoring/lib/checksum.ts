import crypto from 'crypto';

/** Deterministic (key-sorted) JSON serialization, so two runs over the same data always checksum identically. */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

export function sha256Of(value: unknown): string {
  return `sha256:${crypto.createHash('sha256').update(stableStringify(value)).digest('hex')}`;
}
