import esmFileFormat from "./esm_file_format.ts";
import { describe, expect, it } from "../dev_deps.ts";
import { context } from "../tests/utils.ts";

describe("esmFileFormat", () => {
  it("should return format with no IO access", async () => {
    const table: [url: URL | string, format: "module" | "commonjs" | "json"][] =
      [
        ["file:///mod.mjs", "module"],
        ["file:///mod.cjs", "commonjs"],
        ["file:///mod.json", "json"],
      ];

    await Promise.all(table.map(async ([url, format]) => {
      await expect(esmFileFormat(url, context)).resolves.toBe(format);
    }));
  });

  it("should return wasm format if experimentalWasmModules option is true and the URL extension is .wasm", async () => {
    await expect(
      esmFileFormat("file:///mod.wasm", {
        ...context,
        experimentalWasmModules: true,
      }),
    ).resolves.toBe("wasm");
  });

  it("should return commonjs format if URL is ends with .js and the URL scoped package.json does not contain type field", async () => {
    await expect(
      esmFileFormat(
        import.meta.resolve("../tests/node_modules/exports-string/main.js"),
        context,
      ),
    ).resolves.toBe("commonjs");
  });

  it("should return commonjs format if URL does not have extension and the URL scoped package.json does not contain type field", async () => {
    await expect(
      esmFileFormat(
        import.meta.resolve("../tests/node_modules/exports-string/main"),
        context,
      ),
    ).resolves.toBe("commonjs");
  });

  it("should return module format if the URL scoped package.json contain type field", async () => {
    const table: string[] = [
      import.meta.resolve("../tests/node_modules/type-module/main.js"),
      import.meta.resolve("../tests/node_modules/type-module/main"),
    ];

    await Promise.all(table.map(async (url) => {
      await expect(
        esmFileFormat(url, context),
      ).resolves.toBe("module");
    }));
  });

  it("should return undefined if the URL scoped package.json does not contain type field and the URL extension is unknown", async () => {
    await expect(
      esmFileFormat(
        import.meta.resolve("../tests/node_modules/exports-string/main.ts"),
        context,
      ),
    ).resolves.toBe(undefined);
  });
});
