import { initializeDatabases, clearDatabases } from '@test/utils.js'
import {
  clearAllTemporaryDerivedImages
, getDerivedImageFilename
} from '@core/derived-image.js'
import { ensureFile, pathExists } from 'extra-filesystem'

beforeEach(initializeDatabases)
afterEach(clearDatabases)

describe('clearAllTemporaryDerivedImages(): Promise<void>', () => {
  it('deletes temp files', async () => {
    const filename = getDerivedImageFilename('test')
    const tempFilename = `${filename}.tmp`
    await ensureFile(tempFilename)

    await clearAllTemporaryDerivedImages()

    expect(await pathExists(tempFilename)).toBeFalsy()
  })

  it('does not delete non-temp files', async () => {
    const filename = getDerivedImageFilename('test')
    await ensureFile(filename)

    await clearAllTemporaryDerivedImages()

    expect(await pathExists(filename)).toBeTruthy()
  })

})
