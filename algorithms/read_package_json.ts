import { InvalidPackageConfigurationError } from "../error.ts";
import { format, fromFileUrl, join, type JsonValue } from "../deps.ts";
import { Msg } from "./constants.ts";
import { type Context } from "./types.ts";
import { isObject } from "./utils.ts";

export interface PackageJson {
  [key: string]: JsonValue | undefined;
}

/** Reads and parse package.json.
 * @param packageURL The URL of the package directory.
 * @param ctx
 * @throws {InvalidPackageConfigurationError} If the package.json is invalid format.
 * @returns JSON parsed package.json or null if does not exist.
 */
export default async function readPackageJson(
  packageURL: URL | string,
  ctx: Pick<Context, "readFile">,
): Promise<PackageJson | null> {
  // 1. Let pjsonURL be the resolution of "package.json" within packageURL.
  const pjsonURL = join(packageURL, "package.json");

  const file = await ctx.readFile(pjsonURL);
  // 2. If the file at pjsonURL does not exist, then
  if (file === null || file === undefined) {
    // 1. Return null.
    return null;
  }

  // 3. If the file at packageURL does not parse as valid JSON, then
  try {
    // 4. Return the parsed JSON source of the file at pjsonURL.
    const parsed = JSON.parse(file) as JsonValue;

    if (!isObject(parsed)) {
      const message = format(Msg.InvalidPjson, {
        pjsonPath: fromFileUrl(pjsonURL),
      });

      throw new InvalidPackageConfigurationError(message);
    }

    return parsed;
  } catch (e) {
    const message = format(Msg.InvalidPjson, {
      pjsonPath: fromFileUrl(pjsonURL),
    });
    // 1. Throw an Invalid Package Configuration error.
    throw new InvalidPackageConfigurationError(message, { cause: e });
  }
}
