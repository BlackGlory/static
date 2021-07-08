import { buildServer } from '@src/server'
import { resetCache } from '@env/cache'

let server: ReturnType<typeof buildServer>
let address: string

export function getAddress() {
  return address
}

export async function startService() {
  server = buildServer()
  address = await server.listen(0)
}

export async function stopService() {
  server.metrics.clearRegister()
  await server.close()
  resetEnvironment()
}

export async function resetEnvironment() {
  // assigning a property on `process.env` will implicitly convert the value to a string.
  // use `delete` to delete a property from `process.env`.
  // see also: https://nodejs.org/api/process.html#process_process_env
  delete process.env.STATIC_DATA
  delete process.env.STATIC_NOT_FOUND_CACHE_CONTROL
  delete process.env.STATIC_FOUND_CACHE_CONTROL

  // reset memoize
  resetCache()
}
