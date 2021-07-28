import { startService, stopService, getAddress } from '@test/utils'
import { fetch } from 'extra-fetch'
import { get } from 'extra-request'
import { url, pathname } from 'extra-request/lib/es2018/transformers'
import { toText } from 'extra-response'

jest.mock('@dao/data-in-sqlite3/database')

beforeEach(startService)
afterEach(stopService)

describe('robots', () => {
  describe('GET /robots.txt', () => {
    it('200', async () => {
      const res = await fetch(get(
        url(getAddress())
      , pathname('/robots.txt')
      ))

      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/plain')
      expect(await toText(res)).toBe(
        'User-agent: *' + '\n'
      + 'Disallow: /'
      )
    })
  })
})
