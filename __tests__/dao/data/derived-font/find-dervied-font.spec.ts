import { DerviedFontDAO } from '@dao/data/derived-font/index.js'
import { initializeDatabases, clearDatabases } from '@test/utils.js'
import { setRawDerivedFont } from './utils.js'
import { v4 as createUUID } from 'uuid'

beforeEach(initializeDatabases)
afterEach(clearDatabases)

describe('findDerivedFont(filename: string, mtime: number, metadata: IFontMatadata): void', () => {
  describe('exists', () => {
    it('remove record', () => {
      const derivedFont = setRawDerivedFont({
        uuid: createUUID()
      , filename: 'filename'
      , mtime: 0
      , format: 'woff'
      , subset: ' DHLORWelo'
      })

      const result = DerviedFontDAO.findDerivedFont('filename', 0, {
        format: 'woff'
      , subset: 'Hello WORLD'
      })

      expect(result).toBe(derivedFont.uuid)
    })
  })

  describe('does not exist', () => {
    it('return null', () => {
      const result = DerviedFontDAO.findDerivedFont('filename', 0, {
        format: 'woff'
      , subset: 'Hello WORLD'
      })

      expect(result).toBeNull()
    })
  })
})
