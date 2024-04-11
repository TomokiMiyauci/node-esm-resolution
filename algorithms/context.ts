export interface Context {
  /** Read {@link url}. */
  readFile(
    url: URL,
  ): Promise<string | null | undefined> | string | null | undefined;

  /** Whether the {@link url} exists as directory. */
  existDir(url: URL): Promise<boolean> | boolean;

  /** Whether the {@link url} exists as file. */
  existFile(url: URL): Promise<boolean> | boolean;

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
