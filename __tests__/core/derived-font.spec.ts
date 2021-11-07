import { initializeDatabases, clearDatabases } from '@test/utils'
import {
  clearAllTemporaryDerivedFonts
, getDerivedFontFilename
} from '@core/derived-font'
import { ensureFile, pathExists } from 'extra-filesystem'

jest.mock('@dao/data-in-sqlite3/database')

beforeEach(initializeDatabases)
afterEach(clearDatabases)

describe('clearAllTemporaryDerivedFonts(): Promise<void>', () => {
  it('deletes temp files', async () => {
    const filename = getDerivedFontFilename('test')
    const tempFilename = `${filename}.tmp`
    await ensureFile(tempFilename)

    await clearAllTemporaryDerivedFonts()

    expect(await pathExists(tempFilename)).toBeFalsy()
  })

  it('does not delete non-temp files', async () => {
    const filename = getDerivedFontFilename('test')
    await ensureFile(filename)

    await clearAllTemporaryDerivedFonts()

    expect(await pathExists(filename)).toBeTruthy()
  })
})
