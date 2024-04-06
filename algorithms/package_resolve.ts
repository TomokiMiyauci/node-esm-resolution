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
import { buildInModules, join } from "../deps.ts";
import { type Context } from "./context.ts";

/**
 * @throws {InvalidModuleSpecifierError}
 */
export default function PACKAGE_RESOLVE(
  packageSpecifier: string,
  parentURL: URL,
  ctx: Context,
): string {
  ctx.conditions ??= defaultConditions;

  // 1. Let packageName be undefined.
  let packageName: string;

  // 2. If packageSpecifier is an empty string, then
  if (!packageSpecifier) {
    // 1. Throw an Invalid Module Specifier error.
    throw new InvalidModuleSpecifierError();
  }

  // 3. If packageSpecifier is a Node.js builtin module name, then
  if (buildInModules.has(packageSpecifier)) {
    // 1. Return the string "node:" concatenated with packageSpecifier.
    return `node:${packageSpecifier}`;
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
      // 1. Throw an Invalid Module Specifier error.
      throw new InvalidModuleSpecifierError();
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
    // 1. Throw an Invalid Module Specifier error.
    throw new InvalidModuleSpecifierError();
  }

  // 7. Let packageSubpath be "." concatenated with the substring of packageSpecifier from the position at the length of packageName.
  const packageSubpath = "." +
    packageSpecifier.substring(packageName.length);

  // 8. If packageSubpath ends in "/", then
  if (packageSubpath.endsWith("/")) {
    // 1. Throw an Invalid Module Specifier error.
    throw new InvalidModuleSpecifierError();
  }

  // 9. Let selfUrl be the result of PACKAGE_SELF_RESOLVE(packageName, packageSubpath, parentURL).
  const selfUrl = PACKAGE_SELF_RESOLVE(
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
    const packageURL = join(parentURL, "node_modules/", packageName);

    // 2. Set parentURL to the parent folder URL of parentURL.
    parentURL = getParentURL(parentURL);

    // 3. If the folder at packageURL does not exist, then
    if (!ctx.exist(packageURL)) {
      // 1. Continue the next loop iteration.
      continue;
    }

    // 4. Let pjson be the result of READ_PACKAGE_JSON(packageURL).
    const pjson = READ_PACKAGE_JSON(packageURL, ctx);

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
        return join(packageURL, pjson.main).toString();
      }
    }

    // 7. Otherwise,
    // 1. Return the URL resolution of packageSubpath in packageURL.
    return join(packageURL, packageSubpath).toString();
  }

  // 12. Throw a Module Not Found error.
  throw new ModuleNotFoundError();
}
