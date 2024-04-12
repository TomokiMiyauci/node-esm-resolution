import packageImportsExportsResolve, {
  hasSingleStar,
} from "./package_imports_exports_resolve.ts";
import { describe, expect, it } from "../dev_deps.ts";
import { context } from "../tests/utils.ts";

describe("packageImportsExportsResolve", () => {
  it("should resolve if it is export and exports field contain key", async () => {
    await expect(packageImportsExportsResolve(
      ".",
      { ".": "./main.js" },
      import.meta.resolve("file:///"),
      false,
      [],
      context,
    )).resolves.toEqual(new URL("file:///main.js"));
  });

  it("should resolve if the target key contain star", async () => {
    await expect(packageImportsExportsResolve(
      "./lib/a",
      { "./lib/*": "./lib/*.js" },
      import.meta.resolve("file:///"),
      false,
      [],
      context,
    )).resolves.toEqual(new URL("file:///lib/a.js"));
  });

  it("should resolve if the target key contain star 2", async () => {
    await expect(packageImportsExportsResolve(
      "./lib/a.js",
      { "./lib/*.js": "./lib/*.js" },
      import.meta.resolve("file:///"),
      false,
      [],
      context,
    )).resolves.toEqual(new URL("file:///lib/a.js"));
  });

  it("should resolve if the target keys contain star", async () => {
    await expect(packageImportsExportsResolve(
      "./lib/a",
      { "./lib/*": "./lib/*.js", "./*": "./*.js" },
      import.meta.resolve("file:///"),
      false,
      [],
      context,
    )).resolves.toEqual(new URL("file:///lib/a.js"));
  });

  it("should resolve if the target keys contain star 2", async () => {
    await expect(packageImportsExportsResolve(
      "./a",
      { "./lib/*": "./lib/*.js", "./*": "./*.js" },
      import.meta.resolve("file:///"),
      false,
      [],
      context,
    )).resolves.toEqual(new URL("file:///a.js"));
  });

  it("should return null if does not match", () => {
    expect(packageImportsExportsResolve(
      "",
      {},
      import.meta.resolve("file:///"),
      false,
      [],
      context,
    )).toEqual(null);
  });
});

describe("hasSingleStar", () => {
  it("should return true", () => {
    const table: string[] = [
      "*",
      "a*",
      "*a",
      "*abc",
      "a*bc",
      "ab*c",
      "abc*",
    ];

    table.forEach((value) => {
      expect(hasSingleStar(value)).toBeTruthy();
    });
  });
  it("should return false", () => {
    const table: string[] = [
      "",
      " ",
      "ab",
      "**",
      "* *",
    ];

    table.forEach((value) => {
      expect(hasSingleStar(value)).toBeFalsy();
    });
  });
});
