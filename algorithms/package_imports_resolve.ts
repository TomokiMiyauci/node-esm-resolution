import READ_PACKAGE_JSON from "./read_package_json.ts";
import LOOKUP_PACKAGE_SCOPE from "./lookup_package_scope.ts";
import PACKAGE_IMPORTS_EXPORTS_RESOLVE from "./package_imports_exports_resolve.ts";
import {
  InvalidModuleSpecifierError,
  PackageImportNotDefinedError,
} from "../error.ts";
import { isObject } from "./utils.ts";

export default function PACKAGE_IMPORTS_RESOLVE(
  specifier: `#${string}`, // 1. Assert: specifier begins with "#".
  parentURL: string,
  conditions: string[],
): string {
  // 2. If specifier is exactly equal to "#" or starts with "#/", then
  if (specifier === "#" || specifier.startsWith("#/")) {
    // 1. Throw an Invalid Module Specifier error.
    throw new InvalidModuleSpecifierError();
  }

  // 3. Let packageURL be the result of LOOKUP_PACKAGE_SCOPE(parentURL).
  const packageURL = LOOKUP_PACKAGE_SCOPE(parentURL);

  // 4. If packageURL is not null, then
  if (packageURL !== null) {
    // 1. Let pjson be the result of READ_PACKAGE_JSON(packageURL).
    const pjson = READ_PACKAGE_JSON(packageURL);

    // 2. If pjson.imports is a non-null Object, then
    if (isObject(pjson?.imports)) {
      // 1. Let resolved be the result of PACKAGE_IMPORTS_EXPORTS_RESOLVE( specifier, pjson.imports, packageURL, true, conditions).
      const resolved = PACKAGE_IMPORTS_EXPORTS_RESOLVE(
        specifier,
        pjson.imports as Record<string, string>,
        packageURL,
        true,
        conditions,
      );
      // 2. If resolved is not null or undefined, return resolved.
      if (resolved !== null && resolved !== undefined) return resolved;
    }
  }

  // 5. Throw a Package Import Not Defined error.
  throw new PackageImportNotDefinedError();
}
