import * as DAO from '@dao/data-in-sqlite3/derived-font/find-derived-font'
import { initializeDatabases, clearDatabases } from '@test/utils'
import { setRawDerivedFont } from './utils'
import { v4 as createUUID } from 'uuid'

jest.mock('@dao/data-in-sqlite3/database')

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

      const result = DAO.findDerivedFont('filename', 0, {
        format: 'woff'
      , subset: 'Hello WORLD'
      })

      expect(result).toBe(derivedFont.uuid)
    })
  })

  describe('does not exist', () => {
    it('return null', () => {
      const result = DAO.findDerivedFont('filename', 0, {
        format: 'woff'
      , subset: 'Hello WORLD'
      })

      expect(result).toBeNull()
    })
  })
})
