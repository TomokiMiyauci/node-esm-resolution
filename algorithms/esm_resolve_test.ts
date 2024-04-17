import esmResolve from "./esm_resolve.ts";
import { describe, it } from "../dev_deps.ts";
import { context } from "../tests/utils.ts";

describe("esmResolve", () => {
  it("should ", async () => {
    const s = await esmResolve(
      "#dep",
      import.meta.resolve("../tests/node_modules/imports/mod.ts"),
      context,
    );
  });
});
