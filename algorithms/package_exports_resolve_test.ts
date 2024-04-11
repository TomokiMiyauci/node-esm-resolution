import packageExportsResolve from "./package_exports_resolve.ts";
import {
  assertEquals,
  describe,
  expect,
  format,
  fromFileUrl,
  it,
} from "../dev_deps.ts";
import { Msg } from "./constants.ts";
import { context } from "../tests/utils.ts";

describe("packageExportsResolve", () => {
  it("should throw error if the exports keys are starting with . and not starting with .", async () => {
    const url = "file:///";

    await expect(
      packageExportsResolve(url, ".", { ".": "", "": "" }, [], context),
    ).rejects.toThrow(
      format(Msg.InvalidExportsKeys, { pjsonPath: fromFileUrl(url) }),
    );
  });

  it("should throw error if the exports field does not contain reference to main", async () => {
    const url = "file:///";

    await expect(packageExportsResolve(url, ".", {}, [], context)).rejects
      .toThrow(
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

    await expect(packageExportsResolve(packageURL, subpath, {}, [], context))
      .rejects.toThrow(
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
      (await packageExportsResolve(
        packageURL,
        ".",
        { ".": "./main.js" },
        [],
        context,
      )).toString(),
      new URL("main.js", packageURL).toString(),
    );
  });

  it("should resolve with string exports", async () => {
    const packageURL = "file:///";

    assertEquals(
      (await packageExportsResolve(packageURL, ".", "./main.js", [], context))
        .toString(),
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
        context,
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
        context,
      )).toString(),
      new URL("main.js", packageURL).toString(),
    );
  });
});
