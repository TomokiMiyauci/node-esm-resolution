export interface Context {
  readFile(
    url: URL,
  ): Promise<string | null | undefined> | string | null | undefined;
  exist(url: URL): Promise<boolean> | boolean;
  isDir(url: URL): Promise<boolean>;
  realUrl(url: URL): Promise<URL>;

  /**
   * @default ["node", "import"]
   */
  conditions?: string[];

  experimentalWasmModules?: boolean;
}
