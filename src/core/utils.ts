import * as fs from 'fs/promises'
import * as path from 'path'
import { STORAGE } from '@env/index.js'
import { assert } from '@blackglory/errors'
import { isObject } from '@blackglory/prelude'
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
    assert(isObject(e), 'e must be object')
    if (e.code === 'ENOENT') throw new NotFound()
    throw e
  }
}
