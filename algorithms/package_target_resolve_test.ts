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
  it("should throw error if target is URL format", () => {
    const url = "file:///";
    const target = "file:///";

    expect(() =>
      packageTargetResolve(
        url,
        target,
        null,
        false,
        [],
        context,
      )
    ).toThrow(
      format(Msg.InvalidExportsTarget, {
        target,
        pjsonPath: fromFileUrl(join(url, "package.json")),
      }),
    );
  });
});
