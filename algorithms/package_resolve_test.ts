import packageResolve from "./package_resolve.ts";
import { exists } from "jsr:@std/fs";
import { assertEquals, describe, it } from "../dev_deps.ts";
import { builtinModules } from "node:module";

describe("packageResolve", () => {
  it("should return node protocol URL when it give node built in module name as specifier", async () => {
    const table: [specifier: string, expected: string][] = [
      ...builtinModules.filter((module) => !hasSubpath(module)).filter(
        isNotTest,
      ).map((module) => [module, `node:${module}`] as [string, string]),
      ["node:crypto", "node:node:crypto"], // This is OK. `packageResolve` is not responsible for checking the `node:` protocol
    ];

    await Promise.all(table.map(async ([specifier, expected]) => {
      const result = await packageResolve(
        specifier,
        "file:///",
        {
          exist: exists,
          readFile: (url) => {
            return Deno.readTextFile(url);
          },
        },
      );

      assertEquals(result.toString(), expected);
    }));
  });
});

function hasSubpath(input: string): boolean {
  return input.includes("/");
}

function isNotTest(input: string): boolean {
  return input !== "test";
}
