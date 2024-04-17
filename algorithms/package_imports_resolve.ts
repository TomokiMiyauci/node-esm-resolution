import READ_PACKAGE_JSON from "./read_package_json.ts";
import LOOKUP_PACKAGE_SCOPE from "./lookup_package_scope.ts";
import PACKAGE_IMPORTS_EXPORTS_RESOLVE from "./package_imports_exports_resolve.ts";
import {
  InvalidModuleSpecifierError,
  PackageImportNotDefinedError,
} from "../error.ts";
import { isObject } from "./utils.ts";
import { format, fromFileUrl, join } from "../deps.ts";
import { type Context } from "./types.ts";
import { Msg } from "./constants.ts";

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
    const message = format(Msg.InvalidImportsSpecifier, {
      specifier,
      basePath: fromFileUrl(parentURL),
    });

    // 1. Throw an Invalid Module Specifier error.
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

  const basePath = fromFileUrl(parentURL);
  const message = packageURL
    ? format(Msg.NotDefinedImports, {
      specifier,
      pjsonPath: fromFileUrl(join(packageURL, "package.json")),
      basePath,
    })
    : format(Msg.NoPjsonWithImports, { specifier, basePath });
  // 5. Throw a Package Import Not Defined error.
  throw new PackageImportNotDefinedError(message);
}
