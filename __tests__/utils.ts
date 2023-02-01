import * as Data from '@dao/data/database.js'
import { buildServer } from '@src/server.js'
import { resetCache } from '@env/cache.js'
import { emptyDir } from 'extra-filesystem'
import { writeFile } from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'url'

let server: ReturnType<typeof buildServer>
let address: string

export function getAddress() {
  return address
}

export async function startService() {
  await initializeDatabases()
  server = buildServer()
  address = await server.listen()
}

export async function stopService() {
  await server.close()
  clearDatabases()
  clearDerivedFiles()
  resetEnvironment()
}

export async function initializeDatabases() {
  Data.openDatabase()
  await Data.prepareDatabase()
}

export async function clearDatabases() {
  Data.closeDatabase()
}

export async function clearDerivedFiles() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
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
  delete process.env.STATIC_DISABLE_ACCESS_TO_ORIGINAL_IMAGES
  delete process.env.STATIC_DISABLE_ACCESS_TO_ORIGINAL_FONTS

  // reset memoize
  resetCache()
}
