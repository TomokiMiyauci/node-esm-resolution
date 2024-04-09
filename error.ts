export class InvalidPackageConfigurationError extends Error {
  override name: string = "InvalidPackageConfigurationError";
}

export class InvalidModuleSpecifierError extends Error {
  override name: string = "InvalidModuleSpecifierError";
}

export class InvalidPackageTargetError extends Error {
  override name: string = "InvalidPackageTargetError";
}

export class PackagePathNotExportedError extends Error {
  override name: string = "PackagePathNotExportedError";
}

export class ModuleNotFoundError extends Error {
  override name: string = "ModuleNotFoundError";
}

export class PackageImportNotDefinedError extends Error {
  override name: string = "PackageImportNotDefinedError";
}

export class UnsupportedDirectoryImportError extends Error {
  override name: string = "UnsupportedDirectoryImportError";
}
