import * as fs from 'fs/promises'
import * as path from 'path'
import { STORAGE } from '@env'

export function getStaticFilename(filename: string): string {
  return path.join(getStaticDirectory(), filename)
}

export function getStaticDirectory(): string {
  return path.join(STORAGE(), 'files')
}

export async function getMtimestamp(filename: string): Promise<number> {
  const result = await fs.stat(filename)
  return Math.floor(result.mtime.getTime() / 1000)
}
