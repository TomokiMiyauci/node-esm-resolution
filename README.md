# node-esm-resolver

Node.js ES Modules resolution algorithms

This is reference implementation of
[Resolution Algorithm Specification](https://nodejs.org/api/esm.html#resolution-and-loading-algorithm).

Based on the Node.js **v21.7.3** documentation.

## Table of Contents <!-- omit in toc -->

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Documentation](#documentation)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Background

This project will probably only be needed by module bundlers.

The situations where you need that lower level algorithm instead of the
`import.meta.resolve` API is when you want to customize `conditions` and IO. The
`conditions` can customize the resolution of the `exports` field in
package.json. Also, IO is not built in (no side effects) and will work in any
environment.

If you want to learn about module resolution in Node.js, this project may be of
help.

## Install

deno:

```bash
deno add @miyauci/node-esm-resolver
```

npm:

```bash
npx jsr @miyauci/node-esm-resolver
```

## Usage

The `esmResolve` implementation of `ESM_RESOLVE` is used as follows:

```ts
import { esmResolve } from "@miyauci/node-esm-resolver";
import { exists } from "@std/fs";
import { toFileUrl } from "@std/path";

declare const specifier: string;
declare const parentURL: URL | string;

const { format, url } = await esmResolve(specifier, parentURL, {
  readFile: Deno.readTextFile.bind(Deno),
  existFile: (url) => {
    return exists(url, { isFile: true });
  },
  existDir: (url) => {
    return exists(url, { isDirectory: true });
  },
  realUrl: async (url) => {
    const path = await Deno.realPath(url);

    return new URL(toFileUrl(path));
  },
});
```

For lower-level algorithms, see [Documentation](#documentation).

## Documentation

// TODO

## API

See [jsr doc](https://jsr.io/@miyauci/node-esm-resolver) for all APIs.

## Contributing

See [contributing](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2024 Tomoki Miyauchi
