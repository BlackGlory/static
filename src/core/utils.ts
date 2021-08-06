import * as fs from 'fs/promises'
import * as path from 'path'
import { STORAGE } from '@env'

export function getAbsoluteFilename(filename: string): string {
  return path.join(STORAGE(), 'files', filename)
}

export async function getMtimestamp(filename: string): Promise<number> {
  const result = await fs.stat(filename)
  return Math.floor(result.mtime.getTime() / 1000)
}
