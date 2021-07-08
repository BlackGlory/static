import { startService, stopService, getAddress } from '@test/utils'
import { fetch } from 'extra-fetch'
import { get } from 'extra-request'
import { url, pathname } from 'extra-request/lib/es2018/transformers'
import { toText } from 'extra-response'

beforeEach(startService)
afterEach(stopService)

describe('robots', () => {
  describe('GET /health', () => {
    it('200', async () => {
      const res = await fetch(get(
        url(getAddress())
      , pathname('/health')
      ))

      expect(res.status).toBe(200)
    })
  })
})
