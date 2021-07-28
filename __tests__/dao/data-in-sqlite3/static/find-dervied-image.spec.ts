import * as DAO from '@dao/data-in-sqlite3/static/find-derived-image'
import { initializeDatabases, clearDatabases } from '@test/utils'
import { setRawDerivedImage } from './utils'
import { v4 as createUUID } from 'uuid'
import 'jest-extended'

jest.mock('@dao/data-in-sqlite3/database')

beforeEach(initializeDatabases)
afterEach(clearDatabases)

describe('findDerivedImage(filename: string, metadata: IImageMatadata): void', () => {
  describe('exists', () => {
    it('remove record', () => {
      const derivedImage = setRawDerivedImage({
        uuid: createUUID()
      , filename: 'filename'
      , format: 'jpeg'
      , quality: 80
      , width: 800
      , height: 600
      })

      const result = DAO.findDerivedImage('filename', {
        format: 'jpeg'
      , quality: 80
      , width: 800
      , height: 600
      })

      expect(result).toBe(derivedImage.uuid)
    })
  })

  describe('does not exist', () => {
    it('return null', () => {
      const result = DAO.findDerivedImage('filename', {
        format: 'jpeg'
      , quality: 80
      , width: 800
      , height: 600
      })

      expect(result).toBeNull()
    })
  })
})
