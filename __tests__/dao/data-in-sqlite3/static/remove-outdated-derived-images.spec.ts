import * as DAO from '@dao/data-in-sqlite3/static/remove-outdated-derived-images'
import { initializeDatabases, clearDatabases } from '@test/utils'
import { hasRawDerviedImage, setRawDerivedImage } from './utils'
import { v4 as createUUID } from 'uuid'
import 'jest-extended'

jest.mock('@dao/data-in-sqlite3/database')

beforeEach(initializeDatabases)
afterEach(clearDatabases)

describe('removeOutdatedDerivedImage(filename: string, newMtime: number): string[]', () => {
  it('remove records and return uuids', () => {
    const derivedImage1 = setRawDerivedImage({
      uuid: createUUID()
    , filename: 'filename'
    , mtime: 0
    , format: 'jpeg'
    , quality: 80
    , width: 800
    , height: 600
    })
    const derivedImage2 = setRawDerivedImage({
      uuid: createUUID()
    , filename: 'filename'
    , mtime: 1
    , format: 'jpeg'
    , quality: 80
    , width: 800
    , height: 600
    })

    const result = DAO.removeOutdatedDerivedImages('filename', 1)
    const rawDerivedImage1Exists = hasRawDerviedImage(derivedImage1.uuid)
    const rawDerivedImage2Exists = hasRawDerviedImage(derivedImage2.uuid)

    expect(result).toEqual([derivedImage1.uuid])
    expect(rawDerivedImage1Exists).toBeFalse()
    expect(rawDerivedImage2Exists).toBeTrue()
  })
})
