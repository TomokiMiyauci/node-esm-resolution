import { InvalidPackageConfigurationError } from "../error.ts";
import { fromFileUrl, join } from "../deps.ts";
import { type Context } from "./context.ts";

/** Reads package.json.
 * @param packageURL The URL of the package.json file.
 * @param ctx
 * @throws {InvalidPackageConfigurationError}
 * @returns JSON parsed package.json or null if does not exist.
 */
export default async function READ_PACKAGE_JSON(
  packageURL: URL,
  ctx: Pick<Context, "readFile">,
): Promise<Record<string, unknown> | null> {
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
    // TODO add validate object
    return JSON.parse(file);
  } catch (e) {
    // 1. Throw an Invalid Package Configuration error.
    throw new InvalidPackageConfigurationError(
      `The file is invalid JSON format at ${fromFileUrl(pjsonURL)}`,
      { cause: e },
    );
  }
}
