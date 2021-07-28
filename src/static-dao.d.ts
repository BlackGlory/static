interface IStaticDAO {
  setDerivedImage(
    uuid: string
  , filename: string
  , metadata: IImageMetadata
  ): Promise<void>
  removeDerivedImage(uuid: string): Promise<void>
  findDerivedImage(filename: string, metadata: IImageMetadata): Promise<string | null>
}
