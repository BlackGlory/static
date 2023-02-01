import { DerivedImageDAO } from '@dao/data/derived-image/index.js'
import { initializeDatabases, clearDatabases } from '@test/utils.js'
import { hasRawDerviedImage, setRawDerivedImage } from './utils.js'
import { v4 as createUUID } from 'uuid'

beforeEach(initializeDatabases)
afterEach(clearDatabases)

describe('removeDerivedImage(uuid: string): void', () => {
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

      const result = DerivedImageDAO.removeDerivedImage(derivedImage.uuid)
      const rawDerivedImageExists = hasRawDerviedImage(derivedImage.uuid)

      expect(result).toBeUndefined()
      expect(rawDerivedImageExists).toBe(false)
    })
  })

  describe('does not exist', () => {
    it('do nothing', () => {
      const uuid = createUUID()

      const result = DerivedImageDAO.removeDerivedImage(uuid)
      const rawDerivedImageExists = hasRawDerviedImage(uuid)

      expect(result).toBeUndefined()
      expect(rawDerivedImageExists).toBe(false)
    })
  })
})
