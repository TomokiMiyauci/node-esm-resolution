import packageImportsResolve from "./package_imports_resolve.ts";
import { describe, expect, format, fromFileUrl, it } from "../dev_deps.ts";
import { context } from "../tests/utils.ts";
import { Msg } from "./constants.ts";

describe("packageImportsResolve", () => {
  it("should throw error if imports specifier is invalid", async () => {
    const table = ["#", "#/"] as const;
    const url = "file:///";

    await Promise.all(table.map(async (specifier) => {
      await expect(
        packageImportsResolve(specifier, url, [], context),
      ).rejects.toThrow(
        format(Msg.InvalidImportsSpecifier, {
          specifier,
          basePath: fromFileUrl(url),
        }),
      );
    }));
  });

  it("should resolve if the package.json contain imports field", async () => {
    await expect(
      packageImportsResolve(
        "#dep",
        import.meta.resolve("../tests/node_modules/imports/mod.ts"),
        [],
        context,
      ),
    ).resolves.toEqual(
      new URL(import.meta.resolve("../tests/node_modules/imports/main.js")),
    );
  });

  it("should resolve if the package.json contain conditional imports with default", async () => {
    await expect(
      packageImportsResolve(
        "#dep",
        import.meta.resolve("../tests/node_modules/imports-map/mod.ts"),
        [],
        context,
      ),
    ).resolves.toEqual(
      new URL(import.meta.resolve("../tests/node_modules/imports-map/main.js")),
    );
  });

  it("should resolve if the package.json contain conditional imports", async () => {
    await expect(
      packageImportsResolve(
        "#dep",
        import.meta.resolve("../tests/node_modules/imports-map/mod.ts"),
        ["node"],
        context,
      ),
    ).resolves.toEqual(
      new URL(import.meta.resolve("../tests/node_modules/imports-map/node.js")),
    );
  });

  it("should resolve if the package.json contain conditional imports and the specifier contain star", async () => {
    await expect(
      packageImportsResolve(
        "#internal/main.js",
        import.meta.resolve("../tests/node_modules/imports-map/mod.ts"),
        ["node"],
        context,
      ),
    ).resolves.toEqual(
      new URL(
        import.meta.resolve(
          "../tests/node_modules/imports-map/internal/main.js",
        ),
      ),
    );
  });

  it("should throw error if the package.json does not contain imports field", async () => {
    const specifier = "#dep";
    const url = import.meta.resolve(
      "../tests/node_modules/exports-string/mod.ts",
    );

    await expect(
      packageImportsResolve(
        specifier,
        url,
        [],
        context,
      ),
    ).rejects.toThrow(
      format(Msg.NotDefinedImports, {
        specifier,
        pjsonPath: fromFileUrl(new URL("./package.json", url)),
        basePath: fromFileUrl(url),
      }),
    );
  });
});
