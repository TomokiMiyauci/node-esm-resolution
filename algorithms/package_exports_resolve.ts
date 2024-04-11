import {
  InvalidPackageConfigurationError,
  PackagePathNotExportedError,
} from "../error.ts";
import { format, fromFileUrl, partition } from "../deps.ts";
import {
  type Exports,
  isObject,
  isStartWithPeriod,
  type Target,
} from "./utils.ts";
import PACKAGE_TARGET_RESOLVE from "./package_target_resolve.ts";
import PACKAGE_IMPORTS_EXPORTS_RESOLVE from "./package_imports_exports_resolve.ts";
import { type Context } from "./context.ts";
import type { Subpath } from "./types.ts";
import { Msg } from "./constants.ts";

/** Resolves the exports of a package.
 * @param packageURL The URL of the package.json file.
 * @param subpath The subpath of the package to resolve.
 * @param exports Exports field of package.json.
 * @param conditions Conditions to match.
 * @param ctx
 * @throws {InvalidPackageConfigurationError}
 * @returns The resolved package target.
 */
export default async function packageExportsResolve(
  packageURL: URL | string,
  subpath: Subpath,
  exports: Exports,
  conditions: Iterable<string>,
  ctx: Pick<Context, "existDir" | "existFile" | "readFile">,
): Promise<URL> {
  // 1. If exports is an Object with both a key starting with "." and a key not starting with ".", throw an Invalid Package Configuration error.
  if (isObject(exports)) {
    const keys = Object.keys(exports);
    const [startWithPeriod, others] = partition(keys, isStartWithPeriod);

    if (startWithPeriod.length && others.length) {
      const message = format(Msg.InvalidExportsKeys, {
        pjsonPath: fromFileUrl(packageURL),
      });
      throw new InvalidPackageConfigurationError(message);
    }
  }

  // 2. If subpath is equal to ".", then
  if (subpath === ".") {
    // 1. Let mainExport be undefined.
    let mainExport: Target | undefined;

    // 2. If exports is a String or Array, or an Object containing no keys starting with ".", then
    if (
      typeof exports === "string" ||
      Array.isArray(exports) ||
      (isObject(exports) &&
        Object.keys(exports).every((key) => !isStartWithPeriod(key)))
    ) {
      // 1. Set mainExport to exports.
      mainExport = exports;
    } // 3. Otherwise if exports is an Object containing a "." property, then
    else if (isObject(exports) && "." in exports) {
      // 1. Set mainExport to exports["."].
      mainExport = exports["."];
    }

    // 4. If mainExport is not undefined, then
    if (mainExport !== undefined) {
      // 1. Let resolved be the result of PACKAGE_TARGET_RESOLVE( packageURL, mainExport, null, false, conditions).
      const resolved = await PACKAGE_TARGET_RESOLVE(
        packageURL,
        mainExport,
        null,
        false,
        conditions,
        ctx,
      );
      // 2. If resolved is not null or undefined, return resolved.
      if (resolved) return resolved;
    }
  } // 3. Otherwise, if exports is an Object and all keys of exports start with ".", then
  else if (
    isObject(exports) &&
    Object.keys(exports).every(isStartWithPeriod)
  ) {
    // 1. Assert: subpath begins with "./".
    // 2. Let resolved be the result of PACKAGE_IMPORTS_EXPORTS_RESOLVE( subpath, exports, packageURL, false, conditions).
    const resolved = await PACKAGE_IMPORTS_EXPORTS_RESOLVE(
      subpath,
      exports,
      packageURL,
      false,
      conditions,
      ctx,
    );
    // 3. If resolved is not null or undefined, return resolved.
    if (resolved) return resolved;
  }

  const pjsonPath = fromFileUrl(packageURL);
  const message = subpath === "."
    ? format(Msg.PackagePathNotExportedWithoutSubpath, { pjsonPath })
    : format(Msg.PackagePathNotExportedWithSubpath, { subpath, pjsonPath });

  // 4. Throw a Package Path Not Exported error.
  throw new PackagePathNotExportedError(message);
}
