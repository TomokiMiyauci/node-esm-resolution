import { type Context } from "../algorithms/types.ts";
import { exists, toFileUrl } from "../dev_deps.ts";

export const context = {
  readFile: async (url: URL) => {
    try {
      return await Deno.readTextFile(url);
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return null;
      }

      if (e instanceof Deno.errors.IsADirectory) {
        return null;
      }

      throw e;
    }
  },
  existDir: (url) => {
    return exists(url, { isDirectory: true });
  },
  existFile: (url) => {
    return exists(url, { isFile: true });
  },
  realUrl: async (url) => {
    const path = await Deno.realPath(url);

    return new URL(toFileUrl(path));
  },
} satisfies Context;
