/** package.json configuration is invalid or contains an invalid configuration. */
export class InvalidPackageConfigurationError extends Error {
  override name: string = "InvalidPackageConfigurationError";
}

/** Module specifier is an invalid URL, package name or package subpath specifier. */
export class InvalidModuleSpecifierError extends Error {
  override name: string = "InvalidModuleSpecifierError";
}

/** Package exports or imports define a target module for the package that is an invalid type or string target. */
export class InvalidPackageTargetError extends Error {
  override name: string = "InvalidPackageTargetError";
}

/** Package exports do not define or permit a target subpath in the package for the given module. */
export class PackagePathNotExportedError extends Error {
  override name: string = "PackagePathNotExportedError";
}

/** The package or module requested does not exist. */
export class ModuleNotFoundError extends Error {
  override name: string = "ModuleNotFoundError";
}

/** Package imports do not define the specifier. */
export class PackageImportNotDefinedError extends Error {
  override name: string = "PackageImportNotDefinedError";
}

/** The resolved path corresponds to a directory, which is not a supported target for module imports. */
export class UnsupportedDirectoryImportError extends Error {
  override name: string = "UnsupportedDirectoryImportError";
}
