import { hasSinglePattern, secondIndexOf } from "./utils.ts";
import { describe, expect, it } from "../dev_deps.ts";

describe("hasSinglePattern", () => {
  it("should return true", () => {
    const table: [input: string, pattern: string][] = [
      ["a", "a"],
      ["", ""],
      ["abc", "b"],
      ["abc", "ab"],
      ["aab", "ab"],
      ["aab", "aa"],
      ["a*c", "*"],
      ["*\\^$", "^$"],
    ];

    table.forEach(([input, pattern]) => {
      expect(hasSinglePattern(input, pattern)).toBeTruthy();
    });
  });

  it("should return false", () => {
    const table: [input: string, pattern: string][] = [
      ["a", "b"],
      ["aa", "a"],
      ["*\\*^$", "*"],
    ];

    table.forEach(([input, pattern]) => {
      expect(hasSinglePattern(input, pattern)).toBeFalsy();
    });
  });
});

describe("secondIndexOf", () => {
  it("should return -1 if index does not exist", () => {
    const table: [input: string, search: string][] = [
      ["a", "a"],
      ["a", "b"],
      ["abc", "b"],
    ];

    table.forEach(([input, search]) => {
      expect(secondIndexOf(input, search)).toBe(-1);
    });
  });

  it("should return not -1", () => {
    const table: [input: string, search: string, index: number][] = [
      ["", "", 0],
      ["aa", "a", 1],
      ["aaaaa", "a", 1],
      ["aba", "a", 2],
      ["aba", "a", 2],
      ["abcabc", "c", 5],
    ];

    table.forEach(([input, search, index]) => {
      expect(secondIndexOf(input, search)).toBe(index);
    });
  });
});
