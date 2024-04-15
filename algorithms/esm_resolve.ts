import PACKAGE_RESOLVE from "./package_resolve.ts";
import ESM_FILE_FORMAT, { type Format } from "./esm_file_format.ts";
import PACKAGE_IMPORTS_RESOLVE from "./package_imports_resolve.ts";
import { InvalidModuleSpecifierError, ModuleNotFoundError } from "../error.ts";
import { defaultConditions } from "./utils.ts";
import { type Context } from "./context.ts";
import { UnsupportedDirectoryImportError } from "../error.ts";

export interface ResolveResult {
  url: URL;
  format: Format | undefined;
}

/** Resolves the location of the module.
 * @param specifier Module specifier.
 * @param parentURL The URL of the package.json file.
 * @param ctx
 * @returns Module format and resolved URL.
 */
export default async function esmResolve(
  specifier: string,
  parentURL: URL | string,
  ctx: Context,
): Promise<ResolveResult> {
  ctx.conditions ??= defaultConditions;
  // 1. Let resolved be undefined.
  let resolved: URL;

  // 2. If specifier is a valid URL, then
  if (URL.canParse(specifier)) {
    // 1. Set resolved to the result of parsing and reserializing specifier as a URL.
    resolved = new URL(specifier);
  } // 3. Otherwise, if specifier starts with "/", "./", or "../", then
  else if (
    ["/", "./", "../"].some((value) => specifier.startsWith(value))
  ) {
    // 1. Set resolved to the URL resolution of specifier relative to parentURL.
    resolved = new URL(specifier, parentURL);
  } // 4. Otherwise, if specifier starts with "#", then
  else if (specifier.startsWith("#")) {
    // 1. Set resolved to the result of PACKAGE_IMPORTS_RESOLVE(specifier, parentURL, defaultConditions).
    resolved = await PACKAGE_IMPORTS_RESOLVE(
      specifier as `#${string}`,
      parentURL,
      ctx.conditions,
      ctx,
    );
  } // 5. Otherwise,
  else {
    // 1. Note: specifier is now a bare specifier.
    // 2. Set resolved the result of PACKAGE_RESOLVE(specifier, parentURL).
    resolved = await PACKAGE_RESOLVE(specifier, parentURL, ctx);
  }

  // 6. Let format be undefined.
  let format: Format | undefined;

  // // 7. If resolved is a "file:" URL, then
  if (resolved.protocol === "file:") {
    const pattern = /%2F|%5C/;
    // 1. If resolved contains any percent encodings of "/" or "\" ("%2F" and "%5C" respectively), then
    if (pattern.test(resolved.toString())) {
      // 1. Throw an Invalid Module Specifier error.
      throw new InvalidModuleSpecifierError();
    }

    // 2. If the file at resolved is a directory, then
    if (await ctx.existDir(resolved)) {
      // 1. Throw an Unsupported Directory Import error.
      throw new UnsupportedDirectoryImportError();
    }

    // 3. If the file at resolved does not exist, then
    if (!await ctx.existFile(resolved)) {
      // 1. Throw a Module Not Found error.
      throw new ModuleNotFoundError();
    }

    // 4. Set resolved to the real path of resolved, maintaining the same URL querystring and fragment components.
    resolved = await ctx.realUrl(resolved);

    // 5. Set format to the result of ESM_FILE_FORMAT(resolved).
    format = await ESM_FILE_FORMAT(resolved, ctx);

    // 8. Otherwise,
  } else {
    // 1. Set format the module format of the content type associated with the URL resolved.
    // TODO
  }

  // 9. Return format and resolved to the loading phase
  return { format, url: resolved };
}
