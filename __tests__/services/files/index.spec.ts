import { startService, stopService, getAddress } from '@test/utils'
import { fetch } from 'extra-fetch'
import { get } from 'extra-request'
import { url, pathname } from 'extra-request/lib/es2018/transformers'
import * as path from 'path'
import { path as appRoot } from 'app-root-path'
import { NOT_FOUND_CACHE_CONTROL, FOUND_CACHE_CONTROL } from '@env'

beforeEach(async () => {
  process.env.STATIC_DATA = path.join(appRoot, '__tests__/fixtures')
  await startService()
})
afterEach(stopService)

describe('files', () => {
  describe('GET /files/:location', () => {
    describe('file exists', () => {
      describe('shallow', () => {
        it('200', async () => {
          const res = await fetch(get(
            url(getAddress())
          , pathname('/files/shallow')
          ))

          expect(res.status).toBe(200)
          expect(res.headers.has('ETag')).toBe(true)
          expect(res.headers.get('Cache-Control')).toBe(FOUND_CACHE_CONTROL())
        })
      })

      describe('deep', () => {
        it('200', async () => {
          const res = await fetch(get(
            url(getAddress())
          , pathname('/files/directory/deep')
          ))

          expect(res.status).toBe(200)
          expect(res.headers.has('ETag')).toBe(true)
          expect(res.headers.get('Cache-Control')).toBe(FOUND_CACHE_CONTROL())
        })
      })
    })

    describe('file does not exist', () => {
      it('404', async () => {
        const res = await fetch(get(
          url(getAddress())
        , pathname('/files/not-found')
        ))

        expect(res.status).toBe(404)
        expect(res.headers.get('Cache-Control')).toBe(NOT_FOUND_CACHE_CONTROL())
      })
    })

    describe('edge: directory', () => {
      it('404', async () => {
        const res = await fetch(get(
          url(getAddress())
        , pathname('/files/directory')
        ))

        expect(res.status).toBe(404)
        expect(res.headers.get('Cache-Control')).toBe(NOT_FOUND_CACHE_CONTROL())
      })
    })

    describe('edge: dot', () => {
      it('404', async () => {
        const res = await fetch(get(
          url(getAddress())
        , pathname('/files/directory/../shallow')
        ))

        expect(res.status).toBe(200)
        expect(res.headers.has('ETag')).toBe(true)
        expect(res.headers.get('Cache-Control')).toBe(FOUND_CACHE_CONTROL())
      })
    })

    describe('edge: dangerous dot', () => {
      it('404', async () => {
        const res = await fetch(get(
          url(getAddress())
        , pathname('/files/../../package.json')
        ))

        expect(res.status).toBe(404)
        expect(res.headers.has('Cache-Control')).toBe(false)
      })
    })
  })
})
