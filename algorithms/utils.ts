import { escape, existsSync, join, normalize } from "../deps.ts";

export type Target =
  | string
  | string[]
  | Record<string, string | Record<string, string>>
  | null;

export type Exports =
  | string
  | string[]
  | Record<string, string | Record<string, string>>;

export function isStartWithPeriod(input: string): input is `.${string}` {
  return input.startsWith(".");
}

export function readFile(path: string): string | null {
  try {
    return Deno.readTextFileSync(new URL(path));
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return null;
    }

    throw e;
  }
}

export function getParentURL(url: string | URL): URL {
  return normalize(join(url, ".."));
}

export function isFileSystemRoot(url: string): boolean {
  return url === "file:///";
}

export function existFile(url: string): boolean {
  return existsSync(new URL(url), { isFile: true });
}

export function hasSinglePattern(input: string, pattern: string): boolean {
  pattern = escape(pattern);

  const regexp = new RegExp(pattern, "g");
  const matches = input.match(regexp);

  return !!matches && matches.length === 1;
}

export function secondIndexOf(input: string, searchString: string): number {
  const firstIndex = input.indexOf(searchString);

  if (firstIndex === -1) return -1;

  return input.indexOf(searchString, firstIndex + 1);
}

export function existDir(path: string): boolean {
  return existsSync(new URL(path));
}

export const defaultConditions = ["node", "import"];

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" &&
    value.constructor === Object;
}
