import { startService, stopService, getAddress } from '@test/utils.js'
import { fetch } from 'extra-fetch'
import { get } from 'extra-request'
import { url, pathname, searchParams } from 'extra-request/transformers'
import * as path from 'path'
import { getAppRoot } from '@src/utils.js'
import { NOT_FOUND_CACHE_CONTROL, FOUND_CACHE_CONTROL } from '@env/index.js'
import { computeSignature } from '@core/signature.js'
import sharp from 'sharp'
import * as fontkit from 'fontkit'

beforeEach(async () => {
  process.env.STATIC_SECRET = 'secret'
  process.env.STATIC_STORAGE = path.join(getAppRoot(), '__tests__/fixtures')
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
            expect(res.headers.has('Content-Type')).toBe(false)
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
            expect(res.headers.has('Content-Type')).toBe(false)
          })
        })

        describe('specifiy a type', () => {
          it('200, Content-Type: {specify}', async () => {
            const res = await fetch(get(
              url(getAddress())
            , pathname('/files/shallow')
            , searchParams({
                contentType: 'image/png'
              })
            ))

            expect(res.status).toBe(200)
            expect(res.headers.has('ETag')).toBe(true)
            expect(res.headers.get('Cache-Control')).toBe(FOUND_CACHE_CONTROL())
            expect(res.headers.get('Content-Type')).toBe('image/png')
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
            expect(res.headers.get('Content-Type')).toBe('image/png')
          })

          describe('svg', () => {
            it('200, Content-Type: image/svg+xml', async () => {
              const res = await fetch(get(
                url(getAddress())
              , pathname('/files/images/vector.svg')
              ))

              expect(res.status).toBe(200)
              expect(res.headers.has('ETag')).toBe(true)
              expect(res.headers.get('Cache-Control')).toBe(FOUND_CACHE_CONTROL())
              expect(res.headers.get('Content-Type')).toBe('image/svg+xml')
            })
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
            expect(res.headers.get('Content-Type')).toBe('font/ttf')
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

          describe('with contentType', () => {
            it('200, processed font, custom content type', async () => {
              const res = await fetch(get(
                url(getAddress())
              , pathname('/files/fonts/FiraCode-Regular.ttf')
              , searchParams(withSignature({
                  format: 'woff'
                , subset: "'a"
                , contentType: 'application/x-font-woff'
                }))
              ))
              const arrayBuffer = await res.arrayBuffer()
              const buffer = Buffer.from(arrayBuffer)

              expect(res.status).toBe(200)
              expect(res.headers.has('ETag')).toBe(true)
              expect(res.headers.get('Cache-Control')).toBe(FOUND_CACHE_CONTROL())
              expect(res.headers.get('Content-Type')).toBe('application/x-font-woff')
              expect(fontkit.create(buffer).hasGlyphForCodePoint(codePoint("'"))).toBe(true)
              expect(fontkit.create(buffer).hasGlyphForCodePoint(codePoint('a'))).toBe(true)
              expect(fontkit.create(buffer).hasGlyphForCodePoint(codePoint('b'))).toBe(false)
            })
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

          describe('with contentType', () => {
            it('200, processed image, custom content type', async () => {
              const res = await fetch(get(
                url(getAddress())
              , pathname('/files/images/830x415.png')
              , searchParams(withSignature({
                  format: 'webp'
                , quality: '80'
                , maxWidth: '415'
                , contentType: 'application/x-webp'
                }))
              ))
              const arrayBuffer = await res.arrayBuffer()
              const metadata = await sharp(Buffer.from(arrayBuffer)).metadata()

              expect(res.status).toBe(200)
              expect(res.headers.has('ETag')).toBe(true)
              expect(res.headers.get('Cache-Control')).toBe(FOUND_CACHE_CONTROL())
              expect(res.headers.get('Content-Type')).toBe('application/x-webp')
              expect(metadata.format).toBe('webp')
              expect(metadata.width).toBe(415)
              expect(metadata.height).toBe(208)
            })
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
        expect(res.headers.get('Cache-Control')).toBe('private, no-cache')
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
