export interface Context {
  /** Read {@link url}. */
  readFile(
    url: URL,
  ): Promise<string> | string;

  /** Whether {@link url} exists or not. */
  exist(url: URL): Promise<boolean> | boolean;

  /** Whether {@link url} is directory or not. */
  isDir(url: URL): Promise<boolean> | boolean;

  /** Get real `URL` from {@link url}. */
  realUrl(url: URL): Promise<URL> | URL;

  /** Conditions for `exports` field in `package.json`.
   *
   * @default ["node", "import"]
   */
  conditions?: Iterable<string>;

  /** `--experimental-wasm-modules` flag. */
  experimentalWasmModules?: boolean;
}
