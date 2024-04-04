import LOOKUP_PACKAGE_SCOPE from "./lookup_package_scope.ts";
import READ_PACKAGE_JSON from "./read_package_json.ts";
import PACKAGE_EXPORTS_RESOLVE from "./package_exports_resolve.ts";
import { defaultConditions, type Exports } from "./utils.ts";

/** Implementation of PACKAGE_SELF_RESOLVE.
 *
 * @throws {InvalidPackageConfigurationError}
 */
export default function PACKAGE_SELF_RESOLVE(
  packageName: string,
  packageSubpath: string,
  parentURL: URL,
): string | undefined {
  // 1. Let packageURL be the result of LOOKUP_PACKAGE_SCOPE(parentURL).
  const packageURL = LOOKUP_PACKAGE_SCOPE(parentURL);

  // 2. If packageURL is null, then
  if (packageURL === null) {
    // 1. Return undefined.
    return undefined;
  }

  // 3. Let pjson be the result of READ_PACKAGE_JSON(packageURL).
  const pjson = READ_PACKAGE_JSON(packageURL);

  // 4. If pjson is null or if pjson.exports is null or undefined, then
  if (pjson === null || !pjson.exports) {
    // 1. Return undefined.
    return undefined;
  }

  // 5. If pjson.name is equal to packageName, then
  if (pjson.name === packageName) {
    // 1. Return the result of PACKAGE_EXPORTS_RESOLVE(packageURL, packageSubpath, pjson.exports, defaultConditions).
    return PACKAGE_EXPORTS_RESOLVE(
      packageURL,
      packageSubpath,
      pjson.exports as Exports,
      defaultConditions,
    );
  }

  // 6. Otherwise, return undefined.
  return undefined;
}
