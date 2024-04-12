import packageTargetResolve from "./package_target_resolve.ts";
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

describe("packageTargetResolve", () => {
  it("should throw error if target is URL format", async () => {
    const url = "file:///";
    const target = "file:///";

    await expect(
      packageTargetResolve(
        url,
        target,
        null,
        false,
        [],
        context,
      ),
    ).rejects.toThrow(
      format(Msg.InvalidExportsTarget, {
        target,
        pjsonPath: fromFileUrl(join(url, "package.json")),
      }),
    );
  });

  it("should throw error if target is not startsWith './' and isImports is false", async () => {
    const url = "file:///";
    const target = "";

    await expect(
      packageTargetResolve(
        url,
        "",
        null,
        false,
        [],
        context,
      ),
    ).rejects.toThrow(
      format(Msg.InvalidExportsTarget, {
        target,
        pjsonPath: fromFileUrl(join(url, "package.json")),
      }),
    );
  });

  it("should throw error if target is startsWith '../' or '/'", async () => {
    const url = "file:///";
    const table: string[] = ["../", "/"];

    await Promise.all(table.map(async (target) => {
      await expect(
        packageTargetResolve(
          url,
          target,
          null,
          false,
          [],
          context,
        ),
      ).rejects.toThrow(
        format(Msg.InvalidExportsTarget, {
          target,
          pjsonPath: fromFileUrl(join(url, "package.json")),
        }),
      );
    }));
  });

  it("should resolve if the target contains default field", async () => {
    const url = "file:///";

    await expect(
      packageTargetResolve(
        url,
        { default: "./main.js" },
        null,
        false,
        [],
        context,
      ),
    ).resolves.toEqual(new URL("file:///main.js"));
  });

  it("should resolve if the target contains conditions field", async () => {
    const url = "file:///";

    await expect(
      packageTargetResolve(
        url,
        { node: "./node.js" },
        null,
        false,
        ["node"],
        context,
      ),
    ).resolves.toEqual(new URL("file:///node.js"));
  });

  it("should match order by key", async () => {
    const url = "file:///";

    await expect(
      packageTargetResolve(
        url,
        { default: "./main.js", node: "./node.js" },
        null,
        false,
        ["node"],
        context,
      ),
    ).resolves.toEqual(new URL("file:///main.js"));
  });

  it("should match order by key 2", async () => {
    const url = "file:///";

    await expect(
      packageTargetResolve(
        url,
        { node: "./node.js", default: "./main.js" },
        null,
        false,
        ["node"],
        context,
      ),
    ).resolves.toEqual(new URL("file:///node.js"));
  });

  it("should return undefined if the conditions does not match", async () => {
    const url = "file:///";

    await expect(
      packageTargetResolve(
        url,
        {},
        null,
        false,
        [],
        context,
      ),
    ).resolves.toEqual(undefined);
  });

  it("should return null if target is empty array", async () => {
    const url = "file:///";

    await expect(
      packageTargetResolve(
        url,
        [],
        null,
        false,
        [],
        context,
      ),
    ).resolves.toEqual(null);
  });

  it("should resolve if target is array", async () => {
    const url = "file:///";

    await expect(
      packageTargetResolve(
        url,
        ["./main.js"],
        null,
        false,
        [],
        context,
      ),
    ).resolves.toEqual(new URL("file:///main.js"));
  });

  it("should return null if target is null", async () => {
    const url = "file:///";

    await expect(
      packageTargetResolve(
        url,
        null,
        null,
        false,
        [],
        context,
      ),
    ).resolves.toEqual(null);
  });

  it("should return null if array of target contains null", async () => {
    const url = "file:///";

    await expect(
      packageTargetResolve(
        url,
        [null],
        null,
        false,
        [],
        context,
      ),
    ).resolves.toEqual(null);
  });

  it("should throw error if target is invalid value", async () => {
    const url = "file:///";

    const table: unknown[] = [undefined, 0, Symbol(), 0n, new Set()];

    await Promise.all(table.map(async (target) => {
      await expect(
        packageTargetResolve(
          url,
          target,
          null,
          false,
          [],
          context,
        ),
      ).rejects.toThrow();
    }));
  });

  it("should skip invalid target", async () => {
    const url = "file:///";

    await expect(
      packageTargetResolve(
        url,
        [undefined, "./main.js"],
        null,
        false,
        [],
        context,
      ),
    ).resolves.toEqual(new URL("file:///main.js"));
  });

  it("should skip if target of object does not match", async () => {
    const url = "file:///";

    await expect(
      packageTargetResolve(
        url,
        { default: {}, node: "./node.js" },
        null,
        false,
        ["node"],
        context,
      ),
    ).resolves.toEqual(new URL("file:///node.js"));
  });

  it("should resolve with string target what contain star and not pattern key", async () => {
    const url = "file:///";

    await expect(
      packageTargetResolve(
        url,
        "./*.js",
        null,
        false,
        ["node"],
        context,
      ),
    ).resolves.toEqual(new URL("file:///*.js"));
  });

  it("should resolve with string target what contain star and pattern key", async () => {
    const url = "file:///";

    await expect(
      packageTargetResolve(
        url,
        "./*.js",
        "lib/a",
        false,
        ["node"],
        context,
      ),
    ).resolves.toEqual(new URL("file:///lib/a.js"));
  });
});
