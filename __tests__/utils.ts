import { buildServer } from '@src/server'

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
}
