import { resolve } from "../deps.ts";
import { existFile, getParentURL, isFileSystemRoot } from "./utils.ts";

export default function LOOKUP_PACKAGE_SCOPE(url: string): string | null {
  // 1. Let scopeURL be url.
  let scopeURL = url;

  // 2. While scopeURL is not the file system root,
  while (!isFileSystemRoot(scopeURL)) {
    // 1. Set scopeURL to the parent URL of scopeURL.
    scopeURL = getParentURL(scopeURL).toString();

    // 2. If scopeURL ends in a "node_modules" path segment, return null.
    // TODO check with path segment
    if (scopeURL.endsWith("node_modules")) return null;

    // 3. Let pjsonURL be the resolution of "package.json" within scopeURL.
    const pjsonURL = resolve(scopeURL, "package.json");

    // 4. if the file at pjsonURL exists, then
    if (existFile(pjsonURL)) {
      // 1. Return scopeURL.
      return scopeURL;
    }
  }

  // 3. Return null.
  return null;
}
