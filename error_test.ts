import {
  InvalidModuleSpecifierError,
  InvalidPackageConfigurationError,
  InvalidPackageTargetError,
  ModuleNotFoundError,
  PackageImportNotDefinedError,
  PackagePathNotExportedError,
  UnsupportedDirectoryImportError,
} from "./error.ts";
import { describe, expect, it } from "./dev_deps.ts";

const table: { new (): Error }[] = [
  InvalidModuleSpecifierError,
  InvalidPackageConfigurationError,
  InvalidPackageTargetError,
  ModuleNotFoundError,
  PackageImportNotDefinedError,
  PackagePathNotExportedError,
  UnsupportedDirectoryImportError,
];

describe("errors family", () => {
  it("should override name", () => {
    table.forEach((error) => {
      expect(new error().name).toBe(error.name);
    });
  });
});
