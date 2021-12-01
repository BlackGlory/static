import * as fs from 'fs/promises'
import * as path from 'path'
import { STORAGE } from '@env'
import { assert } from '@blackglory/errors'
import { isRecord } from '@blackglory/types'
import { NotFound } from './errors'

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
    assert(isRecord(e))
    if (e.code === 'ENOENT') throw new NotFound()
    throw e
  }
}
