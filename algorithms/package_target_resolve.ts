import {
  InvalidModuleSpecifierError,
  InvalidPackageTargetError,
} from "../error.ts";
import { isObject } from "./utils.ts";
import { format, fromFileUrl, join } from "../deps.ts";
import PACKAGE_RESOLVE from "./package_resolve.ts";
import { Msg } from "./constants.ts";
import { type Context } from "./types.ts";

/** Resolves the target of a package based on the provided parameters.
 * @param packageURL The URL of the package.json file.
 * @param target The target to resolve.
 * @param patternMatch The pattern to match.
 * @param isImports
 * @param conditions Conditions to match.
 * @param ctx
 * @throws {InvalidPackageTargetError}
 * @returns The resolved target, or null if not found, or undefined if not resolvable.
 */
export default async function packageTargetResolve(
  packageURL: URL | string,
  target: unknown,
  patternMatch: string | null,
  isImports: boolean,
  conditions: Iterable<string>,
  ctx: Pick<Context, "existDir" | "existFile" | "readFile">,
): Promise<URL | null | undefined> {
  // 1. If target is a String, then
  if (typeof target === "string") {
    // 1. If target does not start with "./", then
    if (!target.startsWith("./")) {
      // 1. If isImports is false, or if target starts with "../" or "/", or if target is a valid URL, then
      if (
        !isImports ||
        target.startsWith("../") ||
        target.startsWith("/") ||
        URL.canParse(target)
      ) {
        // 1. Throw an Invalid Package Target error.
        const message = format(Msg.InvalidExportsTarget, {
          target,
          pjsonPath: fromFileUrl(join(packageURL, "package.json")),
        });
        throw new InvalidPackageTargetError(message);
      }

      // 2. If patternMatch is a String, then
      if (typeof patternMatch === "string") {
        const replaced = target.replaceAll("*", patternMatch);

        // 1. Return PACKAGE_RESOLVE(target with every instance of "*" replaced by patternMatch, packageURL + "/").
        return PACKAGE_RESOLVE(replaced, join(packageURL, "/"), ctx);
      }
      // 3. Return PACKAGE_RESOLVE(target, packageURL + "/").
      return PACKAGE_RESOLVE(target, join(packageURL, "/"), ctx);
    }

    const splitted = target.split(pattern);
    // 2. If target split on "/" or "\" contains any "", ".", "..", or "node_modules" segments after the first "." segment, case insensitive and including percent encoded variants, throw an Invalid Package Target error.
    for (
      const segment of splitted.slice(splitted.indexOf(".") + 1).map(
        decodeURIComponent,
      ).map(toLowerCase)
    ) if (targets.has(segment)) throw new InvalidPackageTargetError();

    // 3. Let resolvedTarget be the URL resolution of the concatenation of packageURL and target.
    const resolvedTarget = join(packageURL, target);

    // 4. Assert: packageURL is contained in resolvedTarget.

    // 5. If patternMatch is null, then
    if (patternMatch === null) {
      // 1. Return resolvedTarget.
      return resolvedTarget;
    }

    // 6. If patternMatch split on "/" or "\" contains any "", ".", "..", or "node_modules" segments, case insensitive and including percent encoded variants, throw an Invalid Module Specifier error.
    for (
      const segment of patternMatch.split(pattern).map(decodeURIComponent).map(
        toLowerCase,
      )
    ) if (targets.has(segment)) throw new InvalidModuleSpecifierError();

    // 7. Return the URL resolution of resolvedTarget with every instance of "*" replaced with patternMatch.
    return new URL(resolvedTarget.toString().replaceAll("*", patternMatch));

    // 2. Otherwise, if target is a non-null Object, then
  } else if (isObject(target)) {
    // 1. If target contains any index property keys, as defined in ECMA-262 6.1.7 Array Index, throw an Invalid Package Configuration error.
    // TODO

    // 2. For each property p of target, in object insertion order as,
    for (const p in target) {
      // 1. If p equals "default" or conditions contains an entry for p, then
      if (p === "default" || new Set(conditions).has(p)) {
        // 1. Let targetValue be the value of the p property in target.
        const targetValue = target[p];

        // 2. Let resolved be the result of PACKAGE_TARGET_RESOLVE( packageURL, targetValue, patternMatch, isImports, conditions).
        const resolved = await packageTargetResolve(
          packageURL,
          targetValue,
          patternMatch,
          isImports,
          conditions,
          ctx,
        );

        // 3. If resolved is equal to undefined, continue the loop.
        if (resolved === undefined) continue;

        // 4. Return resolved.
        return resolved;
      }
    }

    // 3. Return undefined.
    return undefined;
  } // 3. Otherwise, if target is an Array, then
  else if (Array.isArray(target)) {
    // 1. If _target.length is zero, return null.
    if (!target.length) return null;

    // 2. For each item targetValue in target, do
    for (const targetValue of target) {
      // 1. Let resolved be the result of PACKAGE_TARGET_RESOLVE( packageURL, targetValue, patternMatch, isImports, conditions), continuing the loop on any Invalid Package Target error.
      try {
        const resolved = await packageTargetResolve(
          packageURL,
          targetValue,
          patternMatch,
          isImports,
          conditions,
          ctx,
        );

        // 2. If resolved is undefined, continue the loop.
        if (resolved === undefined) continue;

        // 3. Return resolved.
        return resolved;
      } catch {
        // continuing the loop on any Invalid Package Target error.
      }
    }
    // 3. Return or throw the last fallback resolution null return or error.
    return null;
  } // 4. Otherwise, if target is null, return null.
  else if (target === null) return null;

  // 5. Otherwise throw an Invalid Package Target error.
  throw new InvalidPackageTargetError();
}

const targets = new Set<string>(["", ".", "..", "node_modules"]);
const pattern = /[\/\\]/;

function toLowerCase(input: string): string {
  return input.toLowerCase();
}
