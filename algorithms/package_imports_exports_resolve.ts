import { hasSinglePattern, type Target } from "./utils.ts";
import PACKAGE_TARGET_RESOLVE from "./package_target_resolve.ts";
import PATTERN_KEY_COMPARE from "./pattern_key_compare.ts";

/**
 * @throws {InvalidPackageTargetError}
 */
export default function PACKAGE_IMPORTS_EXPORTS_RESOLVE(
  matchKey: string,
  matchObj: Record<string, Target>,
  packageURL: URL,
  isImports: boolean,
  conditions: string[],
): string | null | undefined {
  // 1. If matchKey is a key of matchObj and does not contain "*", then
  if (matchKey in matchObj && !matchKey.includes("*")) {
    // 1. Let target be the value of matchObj[matchKey].
    const target = matchObj[matchKey];

    // 2. Return the result of PACKAGE_TARGET_RESOLVE(packageURL, target, null, isImports, conditions).
    return PACKAGE_TARGET_RESOLVE(
      packageURL,
      target,
      null,
      isImports,
      conditions,
    );
  }

  // 2. Let expansionKeys be the list of keys of matchObj containing only a single "*", sorted by the sorting function PATTERN_KEY_COMPARE which orders in descending order of specificity.
  const expansionKeys = Object.keys(matchObj)
    .filter(hasSingleStar)
    .toSorted(PATTERN_KEY_COMPARE)
    .toReversed();

  // 3. For each key expansionKey in expansionKeys, do
  for (const expansionKey of expansionKeys) {
    const firstIndex = expansionKey.indexOf("*");
    // 1. Let patternBase be the substring of expansionKey up to but excluding the first "*" character.
    const patternBase = expansionKey.substring(0, firstIndex); // TODO Test

    // 2. If matchKey starts with but is not equal to patternBase, then
    if (matchKey.startsWith(patternBase) && matchKey !== patternBase) {
      // 1. Let patternTrailer be the substring of expansionKey from the index after the first "*" character.
      const patternTrailer = expansionKey.substring(firstIndex);

      // 2. If patternTrailer has zero length, or if matchKey ends with patternTrailer and the length of matchKey is greater than or equal to the length of expansionKey, then
      if (
        !patternTrailer.length ||
        (matchKey.endsWith(patternTrailer) &&
          matchKey.length >= expansionKey.length)
      ) {
        // 1. Let target be the value of matchObj[expansionKey].
        const target = matchObj[expansionKey];

        // 2. Let patternMatch be the substring of matchKey starting at the index of the length of patternBase up to the length of matchKey minus the length of patternTrailer.
        const patternMatch = matchKey.substring(
          patternBase.length,
          matchKey.length - patternTrailer.length,
        );

        // 3. Return the result of PACKAGE_TARGET_RESOLVE(packageURL, target, patternMatch, isImports, conditions).
        return PACKAGE_TARGET_RESOLVE(
          packageURL,
          target,
          patternMatch,
          isImports,
          conditions,
        );
      }
    }
  }

  // 4. Return null.
  return null;
}

function hasSingleStar(input: string): boolean {
  return hasSinglePattern(input, "*");
}
