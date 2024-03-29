import { DerivedImageDAO } from '@dao/derived-image/index.js'
import { initializeDatabases, clearDatabases } from '@test/utils.js'
import { setRawDerivedImage } from './utils.js'
import { v4 as createUUID } from 'uuid'

beforeEach(initializeDatabases)
afterEach(clearDatabases)

describe('findDerivedImage(filename: string, mtime: number, metadata: IImageMatadata): void', () => {
  describe('exists', () => {
    it('remove record', () => {
      const derivedImage = setRawDerivedImage({
        uuid: createUUID()
      , filename: 'filename'
      , mtime: 0
      , format: 'jpeg'
      , quality: 80
      , width: 800
      , height: 600
      })

      const result = DerivedImageDAO.findDerivedImage('filename', 0, {
        format: 'jpeg'
      , quality: 80
      , width: 800
      , height: 600
      })

      expect(result).toBe(derivedImage.uuid)
    })
  })

  describe('does not exist', () => {
    it('return null', () => {
      const result = DerivedImageDAO.findDerivedImage('filename', 0, {
        format: 'jpeg'
      , quality: 80
      , width: 800
      , height: 600
      })

      expect(result).toBeNull()
    })
  })
})
