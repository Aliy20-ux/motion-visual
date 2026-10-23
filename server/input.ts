/**
 * True if the text contains a control character other than tab, line feed or carriage return.
 * NUL in particular is never valid input: Postgres rejects it, and a request that always fails to save
 * would also skip the database's rate limits.
 */
export function hasControlChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if ((c < 32 && c !== 9 && c !== 10 && c !== 13) || c === 127) return true;
  }
  return false;
}
