import { IDerivedFontMetadata } from '@api/contract.js'
export { IDerivedFontMetadata } from '@api/contract.js'

export interface IDerivedFontDAO {
  normalizeSubset(subset: string): string

  setDerivedFont(
    uuid: string
  , filename: string
  , mtime: number
  , metadata: IDerivedFontMetadata
  ): void

  findDerivedFont(
    filename: string
  , mtime: number
  , metadata: IDerivedFontMetadata
  ): string | null

  removeDerivedFont(uuid: string): void
  removeOutdatedDerivedFonts(filename: string, newMtime: number): string[]
}
