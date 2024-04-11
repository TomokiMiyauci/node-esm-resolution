import patternKeyCompare from "./pattern_key_compare.ts";
import { assertEquals, describe, it } from "../dev_deps.ts";

describe("patternKeyCompare", () => {
  it("should return order", () => {
    const table: [left: string, right: string, expected: number][] = [
      ["/", "/", 1],
      ["a/", "/", -1],
      ["/", "a/", 1],
      ["a/", "a/", 1],
      ["a/", "b/", 1],
      ["aa/", "b/", -1],
      ["a/", "bb/", 1],
      ["*", "*", 0],
      ["*a", "*", -1],
      ["*", "*a", 1],
      ["*a", "*a", 0],
      ["*a", "*ab", 1],
      ["*ab", "*a", -1],
      ["*a", "a*", 1],
      ["a*", "*a", -1],
      ["aa*", "a*a", -1],
      ["aa*", "*aa", -1],
      ["a*a", "aa*", 1],
      ["*aa", "a*a", 1],
      ["a*a", "a*a", 0],
      ["*", "a", -1],
      ["a", "*", 1],
    ];

    table.forEach(([left, right, expected]) => {
      assertEquals(patternKeyCompare(left, right), expected);
    });
  });
});
