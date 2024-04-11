import packageExportsResolve from "./package_exports_resolve.ts";
import { exists } from "jsr:@std/fs";
import { fromFileUrl } from "jsr:@std/path";
import { describe, expect, format, it } from "../dev_deps.ts";
import { Msg } from "./constants.ts";

describe("packageExportsResolve", () => {
  it("should throw error if the exports keys are starting with . and not starting with .", async () => {
    const url = "file:///package.json";

    await expect(packageExportsResolve(url, ".", { ".": "", "": "" }, [], {
      exist: exists,
      readFile: (url) => {
        return Deno.readTextFile(url);
      },
    })).rejects.toThrow(
      format(Msg.InvalidExportsKeys, { pjsonPath: fromFileUrl(url) }),
    );
  });

  it("should throw error if the exports field does not contain reference to main", async () => {
    const packageURL = import.meta.resolve(
      "../tests/node_modules/pjson-empty/package.json",
    );

    await expect(packageExportsResolve(packageURL, ".", {}, [], {
      exist: exists,
      readFile: (url) => {
        return Deno.readTextFile(url);
      },
    })).rejects.toThrow(
      new RegExp(
        format(Msg.PackagePathNotExportedWithoutSubpath, {
          pjsonPath: fromFileUrl(packageURL),
        }),
      ),
    );
  });

  it("should throw error if the exports field does not contain reference to main and subpath exist", async () => {
    const packageURL = import.meta.resolve(
      "../tests/node_modules/pjson-empty/package.json",
    );
    const subpath = "./";

    await expect(packageExportsResolve(packageURL, subpath, {}, [], {
      exist: exists,
      readFile: (url) => {
        return Deno.readTextFile(url);
      },
    })).rejects.toThrow(
      new RegExp(
        format(Msg.PackagePathNotExportedWithSubpath, {
          subpath,
          pjsonPath: fromFileUrl(packageURL),
        }),
      ),
    );
  });
});
