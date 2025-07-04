/**
 * 1 – 65 535 inclusive, expressed as a nominal branded type so it
 * can’t be confused with arbitrary numbers elsewhere in the code-base.
 */
export type PortNumber = number & { readonly __brand: unique symbol };

/**
 * Runtime type-guard verifying a value is a valid TCP/HTTP port.
 */
export function isPortNumber(n: unknown): n is PortNumber {
  return (
    typeof n === 'number' &&
    Number.isInteger(n) &&
    n >= 1 &&
    n <= 65_535
  );
}