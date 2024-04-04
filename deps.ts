export { partition } from "jsr:@std/collections/partition";
export { extname, join, normalize } from "jsr:@std/url@^0.221.0";
export { escape } from "jsr:@std/regexp";
export { existsSync } from "jsr:@std/fs/exists";
import { builtinModules as _builtinModules } from "node:module";

export const buildInModules = /* #__PURE__*/ new Set<string>(_builtinModules);
