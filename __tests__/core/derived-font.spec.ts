import { initializeDatabases, clearDatabases } from '@test/utils'
import {
  clearAllTemporaryDerivedFonts
, getDerivedFontFilename
} from '@core/derived-font'
import { ensureFile, pathExists } from 'extra-filesystem'

jest.mock('@dao/data-in-sqlite3/database')

beforeEach(initializeDatabases)
afterEach(clearDatabases)

test('clearAllTemporaryDerivedFonts(): Promise<void>', async () => {
  const filename = getDerivedFontFilename('test')
  const tempFilename = `${filename}.tmp`
  await ensureFile(tempFilename)

  await clearAllTemporaryDerivedFonts()

  expect(await pathExists(tempFilename)).toBeFalsy()
})
