import { InvalidModuleSpecifierError, ModuleNotFoundError } from "../error.ts";
import PACKAGE_SELF_RESOLVE from "./package_self_resolve.ts";
import READ_PACKAGE_JSON from "./read_package_json.ts";
import PACKAGE_EXPORTS_RESOLVE from "./package_exports_resolve.ts";
import {
  defaultConditions,
  type Exports,
  getParentURL,
  isFileSystemRoot,
  secondIndexOf,
} from "./utils.ts";
import { format, isBuiltin, join } from "../deps.ts";
import { type Context } from "./context.ts";

const msg = `Module specifier is invalid. Received '{specifier}'`;

/** Resolves a package specifier to a URL.
 * @param packageSpecifier The package specifier to resolve.
 * @param parentURL The parent URL to use for resolution.
 * @param ctx
 * @throws {InvalidModuleSpecifierError}
 * @returns The resolved URL.
 */
export default async function PACKAGE_RESOLVE(
  packageSpecifier: string,
  parentURL: URL | string,
  ctx: Pick<Context, "exist" | "readFile" | "conditions">,
): Promise<URL> {
  ctx.conditions ??= defaultConditions;

  // 1. Let packageName be undefined.
  let packageName: string;

  // 2. If packageSpecifier is an empty string, then
  if (!packageSpecifier) {
    // 1. Throw an Invalid Module Specifier error.
    throw new InvalidModuleSpecifierError(
      "Module specifier must be a non-empty string",
    );
  }

  // 3. If packageSpecifier is a Node.js builtin module name, then
  if (isBuiltin(packageSpecifier)) {
    // 1. Return the string "node:" concatenated with packageSpecifier.
    return new URL(`node:${packageSpecifier}`);
  }

  // 4. If packageSpecifier does not start with "@", then
  if (!packageSpecifier.startsWith("@")) {
    const index = packageSpecifier.indexOf("/");

    // 1. Set packageName to the substring of packageSpecifier until the first "/" separator or the end of the string.
    packageName = index !== -1
      ? packageSpecifier.substring(0, index)
      : packageSpecifier;
  } // 5. Otherwise,
  else {
    // 1. If packageSpecifier does not contain a "/" separator, then
    if (!packageSpecifier.includes("/")) {
      const message = format(msg, { specifier: packageSpecifier });
      // 1. Throw an Invalid Module Specifier error.
      throw new InvalidModuleSpecifierError(message);
    }

    const index = secondIndexOf(packageSpecifier, "/");
    // 2. Set packageName to the substring of packageSpecifier until the second "/" separator or the end of the string.
    packageName = index !== -1
      ? packageSpecifier.substring(0, index)
      : packageSpecifier;
  }

  // 6. If packageName starts with "." or contains "\" or "%", then
  if (
    packageName.startsWith(".") ||
    packageName.includes("\\") ||
    packageName.includes("%")
  ) {
    const message = format(msg, { specifier: packageSpecifier });
    // 1. Throw an Invalid Module Specifier error.
    throw new InvalidModuleSpecifierError(message);
  }

  // 7. Let packageSubpath be "." concatenated with the substring of packageSpecifier from the position at the length of packageName.
  const packageSubpath = `.${
    packageSpecifier.substring(packageName.length)
  }` as const;

  // 8. If packageSubpath ends in "/", then
  if (packageSubpath.endsWith("/")) {
    const message = format(msg, { specifier: packageSpecifier });
    // 1. Throw an Invalid Module Specifier error.
    throw new InvalidModuleSpecifierError(message);
  }

  // 9. Let selfUrl be the result of PACKAGE_SELF_RESOLVE(packageName, packageSubpath, parentURL).
  const selfUrl = await PACKAGE_SELF_RESOLVE(
    packageName,
    packageSubpath,
    parentURL,
    ctx,
  );

  // 10. If selfUrl is not undefined, return selfUrl.
  if (selfUrl !== undefined) return selfUrl;

  // 11. While parentURL is not the file system root,
  while (!isFileSystemRoot(parentURL)) {
    // 1. Let packageURL be the URL resolution of "node_modules/" concatenated with packageSpecifier, relative to parentURL.
    // @remarks: Maybe not `packageSpecifier`, but packageName
    const packageURL = new URL("node_modules/" + packageName, parentURL);

    // 2. Set parentURL to the parent folder URL of parentURL.
    parentURL = getParentURL(parentURL);

    // 3. If the folder at packageURL does not exist, then
    if (!await ctx.exist(packageURL)) {
      // 1. Continue the next loop iteration.
      continue;
    }

    // 4. Let pjson be the result of READ_PACKAGE_JSON(packageURL).
    const pjson = await READ_PACKAGE_JSON(packageURL, ctx);

    // 5. If pjson is not null and pjson.exports is not null or undefined, then
    if (
      pjson !== null && (pjson.exports !== null && pjson.exports !== undefined)
    ) {
      // 1. Return the result of PACKAGE_EXPORTS_RESOLVE(packageURL, packageSubpath, pjson.exports, defaultConditions).
      return PACKAGE_EXPORTS_RESOLVE(
        packageURL,
        packageSubpath,
        pjson.exports as Exports,
        ctx.conditions,
        ctx,
      );

      // 6. Otherwise, if packageSubpath is equal to ".", then
    } else if (packageSubpath === ".") {
      // 1. If pjson.main is a string, then
      if (pjson !== null && typeof pjson.main === "string") {
        // 1. Return the URL resolution of main in packageURL.
        return join(packageURL, pjson.main);
      }
    }

    // 7. Otherwise,
    // 1. Return the URL resolution of packageSubpath in packageURL.
    return join(packageURL, packageSubpath);
  }

  // 12. Throw a Module Not Found error.
  throw new ModuleNotFoundError(`Cannot find module '${packageSpecifier}'`);
}
