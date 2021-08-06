interface IDerivedImageDAO {
  setDerivedImage(
    uuid: string
  , filename: string
  , mtime: number
  , metadata: IDerivedImageMetadata
  ): Promise<void>

  findDerivedImage(
    filename: string
  , mtime: number
  , metadata: IDerivedImageMetadata
  ): Promise<string | null>

  removeDerivedImage(uuid: string): Promise<void>
  removeOutdatedDerivedImages(filename: string, newMtime: number): Promise<string[]>
}

interface IDerivedFontDAO {
  normalizeSubset(subset: string): string

  setDerivedFont(
    uuid: string
  , filename: string
  , mtime: number
  , metadata: IDerivedFontMetadata
  ): Promise<void>

  findDerivedFont(
    filename: string
  , mtime: number
  , metadata: IDerivedFontMetadata
  ): Promise<string | null>

  removeDerivedFont(uuid: string): Promise<void>
  removeOutdatedDerivedFonts(filename: string, newMtime: number): Promise<string[]>
}
