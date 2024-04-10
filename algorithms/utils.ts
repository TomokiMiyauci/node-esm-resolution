import { escape, join, normalize } from "../deps.ts";

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

export function isFileSystemRoot(url: URL | string): boolean {
  return new URL(url).pathname === "/";
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

export const defaultConditions = ["node", "import"];

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" &&
    value.constructor === Object;
}

export function getParentURL(url: URL | string): URL {
  return normalize(join(url, "..", "/"));
}
