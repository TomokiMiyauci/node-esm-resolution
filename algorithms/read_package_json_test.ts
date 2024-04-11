import readPackageJson from "./read_package_json.ts";
import {
  describe,
  expect,
  format,
  fromFileUrl,
  it,
  join,
} from "../dev_deps.ts";
import { Msg } from "./constants.ts";
import { context } from "../tests/utils.ts";

describe("readPackageJson", () => {
  it("should return parsed package.json", async () => {
    const table: [
      packageURL: URL | string,
      expected: Record<string, unknown> | null,
    ][] = [
      [import.meta.resolve("../tests/node_modules/exports-string"), {
        exports: "./main.js",
      }],

      [import.meta.resolve("../tests/node_modules/exports-subpath-string"), {
        "exports": {
          "./a": "./b.js",
        },
      }],
      [import.meta.resolve("../tests/node_modules/exports-sugar"), {
        "exports": {
          ".": "./main.js",
        },
      }],
      [import.meta.resolve("../tests/node_modules/pjson-empty"), {
        "exports": "",
      }],
    ];

    await Promise.all(table.map(async ([packageURL, expected]) => {
      await expect(readPackageJson(packageURL, context)).resolves.toEqual(
        expected,
      );
    }));
  });

  it(
    "should throw error if the package.json does not exist",
    async () => {
      await expect(
        readPackageJson(
          import.meta.resolve("../tests/node_modules/no-pjson"),
          context,
        ),
      ).resolves.toBe(null);
    },
  );

  it(
    "should throw error if the package.json is invalid",
    async () => {
      const url = import.meta.resolve(
        "../tests/node_modules/package-json-empty",
      );
      await expect(
        readPackageJson(url, context),
      ).rejects.toThrow(
        format(Msg.InvalidPjson, {
          pjsonPath: fromFileUrl(join(url, "package.json")),
        }),
      );
    },
  );
});
