import * as DAO from '@dao/data-in-sqlite3/derived-image/set-derived-image'
import { initializeDatabases, clearDatabases } from '@test/utils'
import { getRawDerivedImage, hasRawDerviedImage, setRawDerivedImage } from './utils'
import { v4 as createUUID } from 'uuid'

jest.mock('@dao/data-in-sqlite3/database')

beforeEach(initializeDatabases)
afterEach(clearDatabases)

describe(`
  setDerivedImage(uuid: string, filename: string, mtime: number, metadata: IImageMetadata): void
`, () => {
  describe('exists', () => {
    it('update', () => {
      const oldRawDerivedImage = setRawDerivedImage({
        uuid: createUUID()
      , filename: 'filename'
      , mtime: 0
      , format: 'jpeg'
      , quality: 80
      , width: 800
      , height: 600
      })
      const uuid = createUUID()

      const result = DAO.setDerivedImage(uuid, 'filename', 0, {
        format: 'jpeg'
      , quality: 80
      , width: 800
      , height: 600
      })
      const oldDerivedImageExists = hasRawDerviedImage(oldRawDerivedImage.uuid)
      const rawDerviedImage = getRawDerivedImage(uuid)

      expect(result).toBeUndefined()
      expect(oldDerivedImageExists).toBe(false)
      expect(rawDerviedImage).toEqual({
        uuid
      , filename: 'filename'
      , mtime: 0
      , format: 'jpeg'
      , quality: 80
      , width: 800
      , height: 600
      })
    })
  })

  describe('does not exist', () => {
    it('insert', () => {
      const uuid = createUUID()

      const result = DAO.setDerivedImage(uuid, 'filename', 0, {
        format: 'jpeg'
      , quality: 80
      , width: 800
      , height: 600
      })
      const rawDerivedImage = getRawDerivedImage(uuid)

      expect(result).toBeUndefined()
      expect(rawDerivedImage).toEqual({
        uuid
      , filename: 'filename'
      , mtime: 0
      , format: 'jpeg'
      , quality: 80
      , width: 800
      , height: 600
      })
    })
  })
})
