import LOOKUP_PACKAGE_SCOPE from "./lookup_package_scope.ts";
import READ_PACKAGE_JSON from "./read_package_json.ts";
import PACKAGE_EXPORTS_RESOLVE from "./package_exports_resolve.ts";
import { defaultConditions, type Exports } from "./utils.ts";
import { type Context } from "./context.ts";
import type { Subpath } from "./types.ts";

/** Resolves package itself.
 * @param packageName Name of package.
 * @param packageSubpath Subpath of package.
 * @param parentURL The parent URL to resolve the import from.
 * @param ctx
 * @throws {InvalidPackageConfigurationError}
 * @returns The resolved URL or undefined.
 */
export default async function packageSelfResolve(
  packageName: string,
  packageSubpath: Subpath,
  parentURL: URL | string,
  ctx: Pick<Context, "conditions" | "existDir" | "existFile" | "readFile">,
): Promise<URL | undefined> {
  ctx.conditions ??= defaultConditions;

  // 1. Let packageURL be the result of LOOKUP_PACKAGE_SCOPE(parentURL).
  const packageURL = await LOOKUP_PACKAGE_SCOPE(parentURL, ctx);

  // 2. If packageURL is null, then
  if (packageURL === null) {
    // 1. Return undefined.
    return undefined;
  }

  // 3. Let pjson be the result of READ_PACKAGE_JSON(packageURL).
  const pjson = await READ_PACKAGE_JSON(packageURL, ctx);

  // 4. If pjson is null or if pjson.exports is null or undefined, then
  // It is not normally null because its existence is confirmed by LOOKUP_PACKAGE_SCOPE.
  if (pjson === null || isNil(pjson.exports)) {
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
      ctx.conditions,
      ctx,
    );
  }

  // 6. Otherwise, return undefined.
  return undefined;
}

function isNil(input: unknown): input is null | undefined {
  return input === null || input === undefined;
}
