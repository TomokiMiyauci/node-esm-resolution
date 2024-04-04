import { InvalidPackageConfigurationError } from "../error.ts";
import { resolve } from "../deps.ts";
import { readFile } from "./utils.ts";

/**
 * @throws {InvalidPackageConfigurationError}
 */
export default function READ_PACKAGE_JSON(
  packageURL: string,
): Record<string, unknown> | null {
  // 1. Let pjsonURL be the resolution of "package.json" within packageURL.
  const pjsonURL = resolve(packageURL, "package.json");

  const file = readFile(pjsonURL);
  // 2. If the file at pjsonURL does not exist, then
  if (file === null) {
    // 1. Return null.
    return null;
  }

  // 3. If the file at packageURL does not parse as valid JSON, then
  try {
    // 4. Return the parsed JSON source of the file at pjsonURL.
    // TODO add validate object
    return JSON.parse(file);
  } catch {
    // 1. Throw an Invalid Package Configuration error.
    throw new InvalidPackageConfigurationError();
  }
}
