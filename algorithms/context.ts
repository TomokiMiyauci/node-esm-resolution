export interface Context {
  /** Read {@link url}.
   * Returns nil if the {@link url} does not exist or the URL is not a file.
   */
  readFile(
    url: URL,
  ): Promise<string | null | undefined> | string | null | undefined;

  /** Whether the {@link url} exists as directory. */
  existDir(url: URL): Promise<boolean> | boolean;

  /** Whether the {@link url} exists as file. */
  existFile(url: URL): Promise<boolean> | boolean;

  /** Get real `URL` from {@link fileURL}.
   * Return nil if the {@link fileURL} does not exist.
   */
  realUrl(
    fileURL: URL,
  ): Promise<URL | null | undefined> | URL | null | undefined;

  /** Conditions for `exports` field in `package.json`.
   *
   * @default ["node", "import"]
   */
  conditions?: Iterable<string>;

  /** `--experimental-wasm-modules` flag. */
  experimentalWasmModules?: boolean;
}
