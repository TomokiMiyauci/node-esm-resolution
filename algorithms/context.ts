export interface Context {
  readFile(url: URL): string | null | undefined;
  exist(url: URL): boolean;
  readPath(url: URL): URL;

  /**
   * @default ["node", "import"]
   */
  conditions?: string[];
}
