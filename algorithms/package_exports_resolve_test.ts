import packageExportsResolve from "./package_exports_resolve.ts";
import { exists } from "jsr:@std/fs";
import { fromFileUrl } from "jsr:@std/path";
import { assertEquals, describe, expect, format, it } from "../dev_deps.ts";
import { Msg } from "./constants.ts";

describe("packageExportsResolve", () => {
  it("should throw error if the exports keys are starting with . and not starting with .", async () => {
    const url = "file:///";

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
    const url = "file:///";

    await expect(packageExportsResolve(url, ".", {}, [], {
      exist: exists,
      readFile: (url) => {
        return Deno.readTextFile(url);
      },
    })).rejects.toThrow(
      new RegExp(
        format(Msg.PackagePathNotExportedWithoutSubpath, {
          pjsonPath: fromFileUrl(url),
        }),
      ),
    );
  });

  it("should throw error if the exports field does not contain reference to main and subpath exist", async () => {
    const packageURL = "file:///";
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

  it("should resolve with sugar exports", async () => {
    const packageURL = "file:///";

    assertEquals(
      (await packageExportsResolve(packageURL, ".", { ".": "./main.js" }, [], {
        exist: exists,
        readFile: (url) => {
          return Deno.readTextFile(url);
        },
      })).toString(),
      new URL("main.js", packageURL).toString(),
    );
  });

  it("should resolve with string exports", async () => {
    const packageURL = "file:///";

    assertEquals(
      (await packageExportsResolve(packageURL, ".", "./main.js", [], {
        exist: exists,
        readFile: (url) => {
          return Deno.readTextFile(url);
        },
      })).toString(),
      new URL("main.js", packageURL).toString(),
    );
  });

  it("should resolve with subpath exports", async () => {
    const packageURL = "file:///";

    assertEquals(
      (await packageExportsResolve(
        packageURL,
        "./a",
        { "./a": "./main.js" },
        [],
        {
          exist: exists,
          readFile: (url) => {
            return Deno.readTextFile(url);
          },
        },
      )).toString(),
      new URL("main.js", packageURL).toString(),
    );
  });

  it("should resolve with default exports", async () => {
    const packageURL = "file:///";

    assertEquals(
      (await packageExportsResolve(
        packageURL,
        ".",
        {
          ".": {
            default: "./main.js",
          },
        },
        [],
        {
          exist: exists,
          readFile: (url) => {
            return Deno.readTextFile(url);
          },
        },
      )).toString(),
      new URL("main.js", packageURL).toString(),
    );
  });
});
