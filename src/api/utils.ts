import * as fs from 'fs/promises'
import * as path from 'path'
import { STORAGE } from '@env/index.js'
import { NotFound } from './errors.js'

export function getStaticFilename(filename: string): string {
  return path.join(getStaticDirectory(), filename)
}

export function getStaticDirectory(): string {
  return path.join(STORAGE(), 'files')
}

/**
 * @throws {NotFound}
 */
export async function getMtimestamp(filename: string): Promise<number> {
  try {
    const result = await fs.stat(filename)
    return Math.floor(result.mtime.getTime() / 1000)
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') throw new NotFound()

    throw e
  }
}
