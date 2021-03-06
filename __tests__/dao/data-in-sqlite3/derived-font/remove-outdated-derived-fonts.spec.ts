import * as DAO from '@dao/data-in-sqlite3/derived-font/remove-outdated-derived-fonts'
import { initializeDatabases, clearDatabases } from '@test/utils'
import { hasRawDerviedFont, setRawDerivedFont } from './utils'
import { v4 as createUUID } from 'uuid'
import 'jest-extended'

jest.mock('@dao/data-in-sqlite3/database')

beforeEach(initializeDatabases)
afterEach(clearDatabases)

describe('removeOutdatedDerivedFont(filename: string, newMtime: number): string[]', () => {
  it('remove records and return uuids', () => {
    const derivedFont1 = setRawDerivedFont({
      uuid: createUUID()
    , filename: 'filename'
    , mtime: 0
    , format: 'woff'
    , subset: 'Hello WORLD'
    })
    const derivedFont2 = setRawDerivedFont({
      uuid: createUUID()
    , filename: 'filename'
    , mtime: 1
    , format: 'woff'
    , subset: 'Hello WORLD'
    })

    const result = DAO.removeOutdatedDerivedFonts('filename', 1)
    const rawDerivedFont1Exists = hasRawDerviedFont(derivedFont1.uuid)
    const rawDerivedFont2Exists = hasRawDerviedFont(derivedFont2.uuid)

    expect(result).toEqual([derivedFont1.uuid])
    expect(rawDerivedFont1Exists).toBeFalse()
    expect(rawDerivedFont2Exists).toBeTrue()
  })
})
