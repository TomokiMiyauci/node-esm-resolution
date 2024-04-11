export const enum Msg {
  InvalidExportsKeys =
    `Package "exports" cannot mix starting with '.' and not starting with '.' keys in {pjsonPath}`,
  PackagePathNotExportedWithSubpath =
    `Package subpath '{subpath}' is not defined by "exports" in {pjsonPath}`,
  PackagePathNotExportedWithoutSubpath =
    `No "exports" main defined in {pjsonPath}`,
}
