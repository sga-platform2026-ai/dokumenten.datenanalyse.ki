const encoder = new TextEncoder();

/**
 * Constant-time string comparison (Edge-compatible, no Node Buffer).
 */
export function verifyPassword(input: string, expected: string): boolean {
  const a = encoder.encode(input);
  const b = encoder.encode(expected);

  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a[i] ^ b[i];
  }

  return mismatch === 0;
}
