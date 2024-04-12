import packageSelfResolve from "./package_self_resolve.ts";
import { describe, expect, it } from "../dev_deps.ts";
import { context } from "../tests/utils.ts";

describe("packageSelfResolve", () => {
  it("should return undefined if the package scope does not exist", async () => {
    await expect(packageSelfResolve(
      "",
      ".",
      import.meta.resolve("../tests/mod.ts"),
      context,
    )).resolves.toBe(undefined);
  });

  it("should return undefined if the package.json does not exist", async () => {
    await expect(packageSelfResolve(
      "",
      ".",
      import.meta.resolve("../tests/selves/exports-null/mod.ts"),
      context,
    )).resolves.toBe(undefined);
  });

  it("should return undefined if the module package.json name field does not equal to packageName", async () => {
    await expect(packageSelfResolve(
      "",
      ".",
      import.meta.resolve("../tests/selves/exports-string/mod.ts"),
      context,
    )).resolves.toEqual(undefined);
  });

  it("should resolve", async () => {
    await expect(packageSelfResolve(
      "pkg",
      ".",
      import.meta.resolve("../tests/selves/exports-string-name-pkg/mod.ts"),
      context,
    )).resolves.toEqual(
      new URL(
        import.meta.resolve("../tests/selves/exports-string-name-pkg/main.js"),
      ),
    );
  });
});
