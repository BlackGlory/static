import * as DAO from '@dao/data-in-sqlite3/derived-font/remove-derived-font'
import { initializeDatabases, clearDatabases } from '@test/utils'
import { hasRawDerviedFont, setRawDerivedFont } from './utils'
import { v4 as createUUID } from 'uuid'

jest.mock('@dao/data-in-sqlite3/database')

beforeEach(initializeDatabases)
afterEach(clearDatabases)

describe('removeDerivedFont(uuid: string): void', () => {
  describe('exists', () => {
    it('remove record', () => {
      const derivedFont = setRawDerivedFont({
        uuid: createUUID()
      , filename: 'filename'
      , mtime: 0
      , format: 'woff'
      , subset: 'subset'
      })

      const result = DAO.removeDerivedFont(derivedFont.uuid)
      const rawDerivedFontExists = hasRawDerviedFont(derivedFont.uuid)

      expect(result).toBeUndefined()
      expect(rawDerivedFontExists).toBe(false)
    })
  })

  describe('does not exist', () => {
    it('do nothing', () => {
      const uuid = createUUID()

      const result = DAO.removeDerivedFont(uuid)
      const rawDerivedFontExists = hasRawDerviedFont(uuid)

      expect(result).toBeUndefined()
      expect(rawDerivedFontExists).toBe(false)
    })
  })
})
