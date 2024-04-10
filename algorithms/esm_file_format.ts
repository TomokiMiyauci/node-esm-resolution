import LOOKUP_PACKAGE_SCOPE from "./lookup_package_scope.ts";
import READ_PACKAGE_JSON from "./read_package_json.ts";
import { extname } from "../deps.ts";
import { type Context } from "./context.ts";

export type Format = "module" | "commonjs" | "json" | "wasm";

/** Resolves file format.
 * @param url The URL.
 * @param ctx
 */
export default async function ESM_FILE_FORMAT(
  url: URL | string,
  ctx: Pick<Context, "exist" | "experimentalWasmModules" | "readFile">,
): Promise<Format | undefined> {
  const ext = extname(url);

  // 1. Assert: url corresponds to an existing file.
  // 2. If url ends in ".mjs", then
  if (ext === ".mjs") {
    // 1. Return "module".
    return "module";
  }

  // 3. If url ends in ".cjs", then
  if (ext === ".cjs") {
    // 1. Return "commonjs".
    return "commonjs";
  }

  // 4. If url ends in ".json", then
  if (ext === ".json") {
    // 1. Return "json".
    return "json";
  }

  // 5. If --experimental-wasm-modules is enabled and url ends in ".wasm", then
  if (ctx?.experimentalWasmModules && ext === ".wasm") {
    // 1. Return "wasm".
    return "wasm";
  }

  // 6. Let packageURL be the result of LOOKUP_PACKAGE_SCOPE(url).
  const packageURL = await LOOKUP_PACKAGE_SCOPE(url, ctx);

  // 7. Let pjson be the result of READ_PACKAGE_JSON(packageURL).
  const pjson = packageURL && await READ_PACKAGE_JSON(packageURL, ctx);

  // 8. Let packageType be null.
  let packageType: "module" | "commonjs" | null = null;
  const type = pjson?.type;

  // 9. If pjson?.type is "module" or "commonjs", then
  if (type === "module" || type === "commonjs") {
    // 1. Set packageType to pjson.type.
    packageType = type;
  }

  // 10. If url ends in ".js", then
  if (ext === ".js") {
    // 1. If packageType is not null, then
    if (packageType !== null) {
      // 1. Return packageType.
      return packageType;
    }

    // 2. If --experimental-detect-module is enabled and the source of module contains static import or export syntax, then
    // if (ctx?.experimentalDetectModule) {
    //   // 1. Return "module".
    //   return "module";
    // }

    // 3. Return "commonjs".
    return "commonjs";
  }

  // 11. If url does not have any extension, then
  if (!ext) {
    // 1. If packageType is "module" and --experimental-wasm-modules is enabled and the file at url contains the header for a WebAssembly module, then
    // if (packageType === "module" && ctx?.experimentalWasmModules) {
    //   // 1. Return "wasm".
    //   return "wasm";
    // }

    // 2. If packageType is not null, then
    if (packageType !== null) {
      // 1. Return packageType.
      return packageType;
    }

    // // 3. If --experimental-detect-module is enabled and the source of module contains static import or export syntax, then
    // // 1. Return "module".
    // return "module";

    // 4. Return "commonjs".
    return "commonjs";
  }

  // 12. Return undefined (will throw during load phase).
  return undefined;
}
