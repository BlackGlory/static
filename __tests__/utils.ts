import * as DataInSqlite3 from '@dao/data-in-sqlite3/database'
import { buildServer } from '@src/server'
import { resetCache } from '@env/cache'
import { emptyDir } from 'extra-filesystem'
import { writeFile } from 'fs/promises'
import * as path from 'path'

let server: ReturnType<typeof buildServer>
let address: string

export function getAddress() {
  return address
}

export async function startService() {
  await initializeDatabases()
  server = buildServer()
  address = await server.listen(0)
}

export async function stopService() {
  server.metrics.clearRegister()
  await server.close()
  clearDatabases()
  clearDerivedImages()
  resetEnvironment()
}

export async function initializeDatabases() {
  DataInSqlite3.openDatabase()
  await DataInSqlite3.prepareDatabase()
}

export async function clearDatabases() {
  DataInSqlite3.closeDatabase()
}

export async function clearDerivedImages() {
  const derivedFonts = path.join(__dirname, 'fixtures/derived-fonts')
  const derivedImages = path.join(__dirname, 'fixtures/derived-images')
  await emptyDir(derivedFonts)
  await emptyDir(derivedImages)
  await writeFile(path.join(derivedFonts, '.gitkeep'), '')
  await writeFile(path.join(derivedImages, '.gitkeep'), '')
}

export async function resetEnvironment() {
  // assigning a property on `process.env` will implicitly convert the value to a string.
  // use `delete` to delete a property from `process.env`.
  // see also: https://nodejs.org/api/process.html#process_process_env
  delete process.env.STATIC_SECRET
  delete process.env.STATIC_NOT_FOUND_CACHE_CONTROL
  delete process.env.STATIC_FOUND_CACHE_CONTROL

  // reset memoize
  resetCache()
}
