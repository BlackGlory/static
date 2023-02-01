import { DerviedFontDAO } from '@dao/data/derived-font/index.js'
import { initializeDatabases, clearDatabases } from '@test/utils.js'
import { getRawDerivedFont, hasRawDerviedFont, setRawDerivedFont } from './utils.js'
import { v4 as createUUID } from 'uuid'

beforeEach(initializeDatabases)
afterEach(clearDatabases)

describe(`
  setDerivedFont(uuid: string, filename: string, mtime: number, metadata: IFontMetadata): void
`, () => {
  describe('exists', () => {
    it('update', () => {
      const oldRawDerivedFont = setRawDerivedFont({
        uuid: createUUID()
      , filename: 'filename'
      , mtime: 0
      , format: 'woff'
      , subset: ' DHLORWelo'
      })
      const uuid = createUUID()

      const result = DerviedFontDAO.setDerivedFont(uuid, 'filename', 0, {
        format: 'woff'
      , subset: 'Hello WORLD'
      })
      const oldDerivedFontExists = hasRawDerviedFont(oldRawDerivedFont.uuid)
      const rawDerviedFont = getRawDerivedFont(uuid)

      expect(result).toBeUndefined()
      expect(oldDerivedFontExists).toBe(false)
      expect(rawDerviedFont).toEqual({
        uuid
      , filename: 'filename'
      , mtime: 0
      , format: 'woff'
      , subset: ' DHLORWelo'
      })
    })
  })

  describe('does not exist', () => {
    it('insert', () => {
      const uuid = createUUID()

      const result = DerviedFontDAO.setDerivedFont(uuid, 'filename', 0, {
        format: 'woff'
      , subset: 'Hello WORLD'
      })
      const rawDerivedFont = getRawDerivedFont(uuid)

      expect(result).toBeUndefined()
      expect(rawDerivedFont).toEqual({
        uuid
      , filename: 'filename'
      , mtime: 0
      , format: 'woff'
      , subset: ' DHLORWelo'
      })
    })
  })
})
