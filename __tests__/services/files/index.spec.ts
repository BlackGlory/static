import { startService, stopService, getAddress } from '@test/utils'
import { fetch } from 'extra-fetch'
import { get } from 'extra-request'
import { url, pathname, searchParams } from 'extra-request/lib/es2018/transformers'
import * as path from 'path'
import { path as appRoot } from 'app-root-path'
import { NOT_FOUND_CACHE_CONTROL, FOUND_CACHE_CONTROL } from '@env'
import { computeSignature } from '@core/signature'
import sharp from 'sharp'
import fontkit from 'fontkit'

jest.mock('@dao/data-in-sqlite3/database')

beforeEach(async () => {
  process.env.STATIC_SECRET = 'secret'
  process.env.STATIC_STORAGE = path.join(appRoot, '__tests__/fixtures')
  await startService()
})
afterEach(stopService)

describe('files', () => {
  describe('GET /files/:location', () => {
    describe('file exists', () => {
      describe('without processing', () => {
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

        describe('image', () => {
          it('200', async () => {
            const res = await fetch(get(
              url(getAddress())
            , pathname('/files/images/830x415.png')
            ))

            expect(res.status).toBe(200)
            expect(res.headers.has('ETag')).toBe(true)
            expect(res.headers.get('Cache-Control')).toBe(FOUND_CACHE_CONTROL())
          })

          describe('DISABLE_ACCESS_TO_ORIGINAL_IMAGES=true', () => {
            it('403', async () => {
              process.env.STATIC_DISABLE_ACCESS_TO_ORIGINAL_IMAGES='true'

              const res = await fetch(get(
                url(getAddress())
              , pathname('/files/images/830x415.png')
              ))

              expect(res.status).toBe(403)
            })
          })
        })

        describe('font', () => {
          it('200', async () => {
            const res = await fetch(get(
              url(getAddress())
            , pathname('/files/fonts/FiraCode-Regular.ttf')
            ))

            expect(res.status).toBe(200)
            expect(res.headers.has('ETag')).toBe(true)
            expect(res.headers.get('Cache-Control')).toBe(FOUND_CACHE_CONTROL())
          })

          describe('DISABLE_ACCESS_TO_ORIGINAL_FONTS=true', () => {
            it('403', async () => {
              process.env.STATIC_DISABLE_ACCESS_TO_ORIGINAL_FONTS='true'

              const res = await fetch(get(
                url(getAddress())
              , pathname('/files/fonts/FiraCode-Regular.ttf')
              ))

              expect(res.status).toBe(403)
            })
          })
        })
      })

      describe('with font processing', () => {
        describe('file isnt a font', () => {
          it('403', async () => {
            const res = await fetch(get(
              url(getAddress())
            , pathname('/files/shallow')
            , searchParams(withSignature({
                format: 'woff'
              , subset: 'subset'
              }))
            ))

            expect(res.status).toBe(403)
          })
        })

        describe('file is a font', () => {
          it('200, processed font', async () => {
            const res = await fetch(get(
              url(getAddress())
            , pathname('/files/fonts/FiraCode-Regular.ttf')
            , searchParams(withSignature({
                format: 'woff'
              , subset: "'a"
              }))
            ))
            const arrayBuffer = await res.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            expect(res.status).toBe(200)
            expect(res.headers.has('ETag')).toBe(true)
            expect(res.headers.get('Cache-Control')).toBe(FOUND_CACHE_CONTROL())
            expect(res.headers.get('Content-Type')).toBe('font/woff')
            expect(fontkit.create(buffer).hasGlyphForCodePoint(codePoint("'"))).toBe(true)
            expect(fontkit.create(buffer).hasGlyphForCodePoint(codePoint('a'))).toBe(true)
            expect(fontkit.create(buffer).hasGlyphForCodePoint(codePoint('b'))).toBe(false)
          })
        })
      })

      describe('with image processing', () => {
        describe('file isnt an image', () => {
          it('403', async () => {
            const res = await fetch(get(
              url(getAddress())
            , pathname('/files/shallow')
            , searchParams(withSignature({
                format: 'jpeg'
              , quality: '80'
              }))
            ))

            expect(res.status).toBe(403)
          })
        })

        describe('file is an image', () => {
          it('200, processed image', async () => {
            const res = await fetch(get(
              url(getAddress())
            , pathname('/files/images/830x415.png')
            , searchParams(withSignature({
                format: 'webp'
              , quality: '80'
              , maxWidth: '415'
              }))
            ))
            const arrayBuffer = await res.arrayBuffer()
            const metadata = await sharp(Buffer.from(arrayBuffer)).metadata()

            expect(res.status).toBe(200)
            expect(res.headers.has('ETag')).toBe(true)
            expect(res.headers.get('Cache-Control')).toBe(FOUND_CACHE_CONTROL())
            expect(res.headers.get('Content-Type')).toBe('image/webp')
            expect(metadata.format).toBe('webp')
            expect(metadata.width).toBe(415)
            expect(metadata.height).toBe(208)
          })
        })
      })
    })

    describe('file does not exist', () => {
      describe('without processing', () => {
        it('404', async () => {
          const res = await fetch(get(
            url(getAddress())
          , pathname('/files/not-found')
          ))

          expect(res.status).toBe(404)
          expect(res.headers.get('Cache-Control')).toBe(NOT_FOUND_CACHE_CONTROL())
        })
      })

      describe('with font processing', () => {
        describe('signature is correct', () => {
          it('404', async () => {
            const res = await fetch(get(
              url(getAddress())
            , pathname('/files/not-found')
            , searchParams(withSignature({
                format: 'woff'
              , subset: 'hello world'
              }))
            ))

            expect(res.status).toBe(404)
            expect(res.headers.get('Cache-Control')).toBe(NOT_FOUND_CACHE_CONTROL())
          })
        })

        describe('signature is incorrect', () => {
          it('403', async () => {
            const res = await fetch(get(
              url(getAddress())
            , pathname('/files/not-found')
            , searchParams({
                signature: 'bad'
              , format: 'woff'
              , subset: 'hello world'
              })
            ))

            expect(res.status).toBe(403)
          })
        })
      })

      describe('with image processing', () => {
        describe('signature is correct', () => {
          it('404', async () => {
            const res = await fetch(get(
              url(getAddress())
            , pathname('/files/not-found')
            , searchParams(withSignature({
                format: 'jpeg'
              , quality: '80'
              }))
            ))

            expect(res.status).toBe(404)
            expect(res.headers.get('Cache-Control')).toBe(NOT_FOUND_CACHE_CONTROL())
          })
        })

        describe('signature is incorrect', () => {
          it('403', async () => {
            const res = await fetch(get(
              url(getAddress())
            , pathname('/files/not-found')
            , searchParams({
                signature: 'bad'
              , format: 'jpeg'
              , quality: '80'
              })
            ))

            expect(res.status).toBe(403)
          })
        })
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

function withSignature(params: Record<string, string>) {
  return {
    signature: computeSignature(params)
  , ...params
  }
}

function codePoint(char: string): number {
  return char.codePointAt(0)!
}
