import packageResolve from "./package_resolve.ts";
import { exists } from "jsr:@std/fs";
import { assertEquals, describe, expect, it } from "../dev_deps.ts";
import { builtinModules } from "node:module";
import { fromFileUrl } from "jsr:@std/path";

const context = {
  exist: exists,
  readFile: (url: URL) => {
    return Deno.readTextFile(url);
  },
};

describe("packageResolve", () => {
  it("should return node protocol URL when it give node built in module name as specifier", async () => {
    const table: [specifier: string, expected: string][] = [
      ...builtinModules.filter((module) => !hasSubpath(module)).filter(
        isNotTest,
      ).map((module) => [module, `node:${module}`] as [string, string]),
      ["node:crypto", "node:node:crypto"], // This is OK. `packageResolve` is not responsible for checking the `node:` protocol
    ];

    await Promise.all(table.map(async ([specifier, expected]) => {
      const result = await packageResolve(specifier, "file:///", context);

      assertEquals(result.toString(), expected);
    }));
  });

  it("should throw error is specifier is empty string", () => {
    expect(packageResolve("", "file:///", context)).rejects.toThrow(
      "Module specifier must be a non-empty string",
    );
  });

  it("should throw error is specifier starts with @ but not contain slash", () => {
    expect(packageResolve("@", "file:///", context)).rejects.toThrow(
      "Module specifier is invalid. Received '@'",
    );
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
      await expect(packageResolve(specifier, "file:///", context)).rejects
        .toThrow(
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
      await expect(packageResolve(specifier, "file:///", context)).rejects
        .toThrow(
          `Module specifier is invalid. Received '${specifier}'`,
        );
    }));
  });

  it("should resolve", async () => {
    const referrer = import.meta.resolve("../tests/mod.ts");
    const url = await packageResolve(
      "exports-subpath-string/a",
      referrer,
      context,
    );

    assertEquals(
      url.toString(),
      new URL("node_modules/exports-subpath-string/b.js", referrer).toString(),
    );
  });

  it("should resolve", async () => {
    const referrer = import.meta.resolve("../tests/mod.ts");
    const url = await packageResolve("exports-string", referrer, context);

    assertEquals(
      url.toString(),
      new URL("node_modules/exports-string/main.js", referrer).toString(),
    );
  });

  it("should resolve", async () => {
    const referrer = import.meta.resolve("../tests/mod.ts");
    const url = await packageResolve("exports-sugar", referrer, context);

    assertEquals(
      url.toString(),
      new URL("node_modules/exports-sugar/main.js", referrer).toString(),
    );
  });

  it("should throw error if the module of package.json is invalid", async () => {
    const referrer = import.meta.resolve("../tests/mod.ts");

    await expect(packageResolve("package-json-empty", referrer, context))
      .rejects.toThrow(
        `The file is invalid JSON format at ${
          fromFileUrl(
            import.meta.resolve(
              "../tests/node_modules/package-json-empty/package.json",
            ),
          )
        }`,
      );
  });
});

function hasSubpath(input: string): boolean {
  return input.includes("/");
}

function isNotTest(input: string): boolean {
  return input !== "test";
}
