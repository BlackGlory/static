interface IStaticDAO {
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
