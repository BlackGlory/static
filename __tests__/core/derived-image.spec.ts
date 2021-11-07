import { initializeDatabases, clearDatabases } from '@test/utils'
import {
  clearAllTemporaryDerivedImages
, getDerivedImageFilename
} from '@core/derived-image'
import { ensureFile, pathExists } from 'extra-filesystem'

jest.mock('@dao/data-in-sqlite3/database')

beforeEach(initializeDatabases)
afterEach(clearDatabases)

test('clearAllTemporaryDerivedImages(): Promise<void>', async () => {
  const filename = getDerivedImageFilename('test')
  const tempFilename = `${filename}.tmp`
  await ensureFile(tempFilename)

  await clearAllTemporaryDerivedImages()

  expect(await pathExists(tempFilename)).toBeFalsy()
})
