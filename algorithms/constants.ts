export const enum Msg {
  InvalidExportsKeys =
    `Package "exports" cannot mix starting with '.' and not starting with '.' keys in {pjsonPath}`,
  PackagePathNotExportedWithSubpath =
    `Package subpath '{subpath}' is not defined by "exports" in {pjsonPath}`,
  PackagePathNotExportedWithoutSubpath =
    `No "exports" main defined in {pjsonPath}`,
  InvalidExportsTarget =
    `Invalid "exports" target '{target}' defined in the package config {pjsonPath}`,
  InvalidPjson = `The file is invalid JSON format at {pjsonPath}`,
  ModuleNotFound = `Cannot find module '{specifier}'`,
  InvalidImportsSpecifier =
    `Invalid module "{specifier}" is not a valid internal imports specifier name imported from {basePath}`,
  NotDefinedImports =
    `Package import specifier "{specifier}" is not defined in package {pjsonPath} imported from {basePath}`,
  NoPjsonWithImports =
    `Package import specifier "{specifier}" is not defined imported from {basePath}`,
}
