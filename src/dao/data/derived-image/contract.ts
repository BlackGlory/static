import { IDerivedImageMetadata } from '@api/contract.js'
export { IDerivedImageMetadata } from '@api/contract.js'

export interface IDerivedImageDAO {
  setDerivedImage(
    uuid: string
  , filename: string
  , mtime: number
  , metadata: IDerivedImageMetadata
  ): void

  findDerivedImage(
    filename: string
  , mtime: number
  , metadata: IDerivedImageMetadata
  ): string | null

  removeDerivedImage(uuid: string): void
  removeOutdatedDerivedImages(filename: string, newMtime: number): string[]
}
