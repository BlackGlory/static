import { findUpPackageFilenameSync } from 'extra-filesystem'
import { fileURLToPath } from 'url'
import path from 'path'
import { assert } from '@blackglory/prelude'

export function getAppRoot(): string {
  const packageFilename = findUpPackageFilenameSync(fileURLToPath(import.meta.url))
  assert(packageFilename, 'The package.json not found')

  return path.dirname(packageFilename)
}
