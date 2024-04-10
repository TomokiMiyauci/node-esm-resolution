import packageResolve from "./package_resolve.ts";
import { exists } from "jsr:@std/fs";
import { assertEquals, describe, expect, it } from "../dev_deps.ts";
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

  it("should throw error is specifier is empty string", () => {
    expect(packageResolve("", "file:///", {
      exist: exists,
      readFile: (url) => {
        return Deno.readTextFile(url);
      },
    })).rejects.toThrow("Module specifier must be a non-empty string");
  });

  it("should throw error is specifier starts with @ but not contain slash", () => {
    expect(packageResolve("@", "file:///", {
      exist: exists,
      readFile: (url) => {
        return Deno.readTextFile(url);
      },
    })).rejects.toThrow("Module specifier is invalid. Received '@'");
  });

  it("should throw error is specifier starts with . or contains \\ or %", async () => {
    const table = [
      ".",
      ".test",
      "\\",
      "te\\st",
      "%",
      "te%st",
      "@scope\\/test",
      "@scope%test",
    ];

    await Promise.all(table.map(async (specifier) => {
      await expect(packageResolve(specifier, "file:///", {
        exist: exists,
        readFile: (url) => {
          return Deno.readTextFile(url);
        },
      })).rejects.toThrow(
        `Module specifier is invalid. Received '${specifier}'`,
      );
    }));
  });

  it("should throw error is specifier of subpath ends with slash", async () => {
    const table = [
      "test/subpath/",
      "/",
    ];

    await Promise.all(table.map(async (specifier) => {
      await expect(packageResolve(specifier, "file:///", {
        exist: exists,
        readFile: (url) => {
          return Deno.readTextFile(url);
        },
      })).rejects.toThrow(
        `Module specifier is invalid. Received '${specifier}'`,
      );
    }));
  });
});

function hasSubpath(input: string): boolean {
  return input.includes("/");
}

function isNotTest(input: string): boolean {
  return input !== "test";
}
