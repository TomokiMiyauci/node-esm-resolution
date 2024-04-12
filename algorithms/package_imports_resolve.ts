import READ_PACKAGE_JSON from "./read_package_json.ts";
import LOOKUP_PACKAGE_SCOPE from "./lookup_package_scope.ts";
import PACKAGE_IMPORTS_EXPORTS_RESOLVE from "./package_imports_exports_resolve.ts";
import {
  InvalidModuleSpecifierError,
  PackageImportNotDefinedError,
} from "../error.ts";
import { isObject } from "./utils.ts";
import { format, fromFileUrl } from "../deps.ts";
import { type Context } from "./context.ts";

const M = `Invalid module "{specifier}" {reason} imported from {base}`;
const reason = `is not a valid internal imports specifier name`;

/** Resolves the given import {@link specifier} for a package.
 * @param specifier The specifier of the import to resolve.
 * @param parentURL The parent URL to resolve the import from.
 * @param conditions Conditions to match.
 * @param ctx
 * @throws {InvalidModuleSpecifierError} If the import specifier is not valid.
 * @throws {PackageImportNotDefinedError} If the import specifier cannot be resolved.
 * @returns The resolved import URL.
 */
export default async function packageImportsResolve(
  specifier: `#${string}`, // 1. Assert: specifier begins with "#".
  parentURL: URL | string,
  conditions: Iterable<string>,
  ctx: Pick<Context, "existDir" | "existFile" | "readFile">,
): Promise<URL> {
  // 2. If specifier is exactly equal to "#" or starts with "#/", then
  if (specifier === "#" || specifier.startsWith("#/")) {
    // 1. Throw an Invalid Module Specifier error.
    const message = format(M, {
      specifier,
      reason,
      base: fromFileUrl(parentURL),
    });
    throw new InvalidModuleSpecifierError(message);
  }

  // 3. Let packageURL be the result of LOOKUP_PACKAGE_SCOPE(parentURL).
  const packageURL = await LOOKUP_PACKAGE_SCOPE(parentURL, ctx);

  // 4. If packageURL is not null, then
  if (packageURL !== null) {
    // 1. Let pjson be the result of READ_PACKAGE_JSON(packageURL).
    const pjson = await READ_PACKAGE_JSON(packageURL, ctx);

    // 2. If pjson.imports is a non-null Object, then
    if (isObject(pjson?.imports)) {
      // 1. Let resolved be the result of PACKAGE_IMPORTS_EXPORTS_RESOLVE( specifier, pjson.imports, packageURL, true, conditions).
      const resolved = await PACKAGE_IMPORTS_EXPORTS_RESOLVE(
        specifier,
        pjson.imports,
        packageURL,
        true,
        conditions,
        ctx,
      );
      // 2. If resolved is not null or undefined, return resolved.
      if (resolved !== null && resolved !== undefined) return resolved;
    }
  }

  const message = packageURL
    ? format(hasPath, {
      specifier,
      path: fromFileUrl(packageURL),
      base: fromFileUrl(parentURL),
    })
    : format(notPath, { specifier, base: fromFileUrl(parentURL) });
  // 5. Throw a Package Import Not Defined error.
  throw new PackageImportNotDefinedError(message);
}

const hasPath =
  `Package import specifier "{specifier}" is not defined in package {path}package.json imported from {base}`;
const notPath =
  `Package import specifier "{specifier}" is not defined imported from {base}`;
