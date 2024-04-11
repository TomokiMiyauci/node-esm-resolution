/** Compares two strings that may contain a wildcard character ('*') and returns a value indicating their order.
 * @param keyA The first string to compare.
 * @param keyB The second string to compare.
 * @returns A negative number if {@link keyA} should come before {@link keyB}, a positive number if {@link keyA} should come after {@link keyB}, or 0 if they are equal.
 */
export default function PATTERN_KEY_COMPARE(
  keyA: string,
  keyB: string,
): 1 | 0 | -1 {
  // 1. Assert: keyA ends with "/" or contains only a single "*".
  // 2. Assert: keyB ends with "/" or contains only a single "*".
  const indexOfKeyA = keyA.indexOf("*");
  const indexOfKeyB = keyB.indexOf("*");

  // 3. Let baseLengthA be the index of "*" in keyA plus one, if keyA contains "*", or the length of keyA otherwise.
  const baseLengthA = indexOfKeyA > -1 ? indexOfKeyA + 1 : keyA.length;

  // 4. Let baseLengthB be the index of "*" in keyB plus one, if keyB contains "*", or the length of keyB otherwise.
  const baseLengthB = indexOfKeyB > -1 ? indexOfKeyB + 1 : keyB.length;

  // 5. If baseLengthA is greater than baseLengthB, return -1.
  if (baseLengthA > baseLengthB) return -1;

  // 6. If baseLengthB is greater than baseLengthA, return 1.
  if (baseLengthB > baseLengthA) return 1;

  // 7. If keyA does not contain "*", return 1.
  if (indexOfKeyA === -1) return 1;

  // 8. If keyB does not contain "*", return -1.
  if (indexOfKeyB === -1) return -1;

  // 9. If the length of keyA is greater than the length of keyB, return -1.
  if (keyA.length > keyB.length) return -1;

  // 10. If the length of keyB is greater than the length of keyA, return 1.
  if (keyB.length > keyA.length) return 1;

  // 11. Return 0.
  return 0;
}
