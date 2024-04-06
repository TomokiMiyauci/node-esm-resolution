import { join } from "../deps.ts";
import { getParentURL, isFileSystemRoot } from "./utils.ts";
import { type Context } from "./context.ts";

export default function LOOKUP_PACKAGE_SCOPE(
  url: URL,
  ctx: Context,
): URL | null {
  // 1. Let scopeURL be url.
  let scopeURL = url;

  // 2. While scopeURL is not the file system root,
  while (!isFileSystemRoot(scopeURL)) {
    const pathSegments = scopeURL.pathname.split("/");

    // 2. If scopeURL ends in a "node_modules" path segment, return null.
    if (pathSegments[pathSegments.length - 1] === "node_modules") return null;

    // 3. Let pjsonURL be the resolution of "package.json" within scopeURL.
    const pjsonURL = join(scopeURL, "package.json");

    // 4. if the file at pjsonURL exists, then
    if (ctx.exist(pjsonURL)) {
      // 1. Return scopeURL.
      return scopeURL;
    }

    // 1. Set scopeURL to the parent URL of scopeURL.
    // @remarks: Probably should be done last.
    scopeURL = getParentURL(scopeURL);
  }

  // 3. Return null.
  return null;
}
