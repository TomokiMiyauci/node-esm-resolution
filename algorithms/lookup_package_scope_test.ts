import lookupPackageScope from "./lookup_package_scope.ts";
import { assertEquals, describe, it } from "../dev_deps.ts";
import { context } from "../tests/utils.ts";

describe("lookupPackageScope", () => {
  it("should return url if package.json exists", async () => {
    const table: [url: URL | string, expected: string | null][] = [
      [import.meta.resolve("../tests/node_modules/no-pjson/mod.ts"), null],
      [
        import.meta.resolve("../tests/node_modules/exports-string/mod.ts"),
        import.meta.resolve("../tests/node_modules/exports-string"),
      ],
      [
        import.meta.resolve(
          "../tests/node_modules/exports-subpath-string/mod.ts",
        ),
        import.meta.resolve("../tests/node_modules/exports-subpath-string"),
      ],
      [
        import.meta.resolve("../tests/node_modules/mod.ts"),
        null,
      ],
    ];

    await Promise.all(table.map(async ([url, expected]) => {
      const result = await lookupPackageScope(url, context);

      assertEquals(result?.toString() ?? null, expected);
    }));
  });
});
