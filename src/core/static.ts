import { computeTargetSize, processImage, readImageMetadata } from './image'
import { StaticDAO } from '@dao/data-in-sqlite3/static'
import { STORAGE } from '@env'
import { pathExists } from 'extra-filesystem'
import * as path from 'path'
import { Mutex } from 'extra-promise'
import { v4 as createUUID } from 'uuid'
import { createWriteStream } from 'fs'
import stringify from 'fast-json-stable-stringify'
import { promisify } from 'util'
import * as stream from 'stream'
import { HashMap } from '@blackglory/structures'
import { assert, CustomError } from '@blackglory/errors'
import { getErrorResultAsync } from 'return-style'
import { isntUndefined } from '@blackglory/types'

export class NotFound extends CustomError {}
export class UnsupportedImageFormat extends CustomError {}

const pipeline = promisify(stream.pipeline)
const targetToLock = new HashMap<
  Record<string, unknown>
, { mutex: Mutex; users: number }
>(stringify)

/**
 * @throws {NotFound} 
 * @throws {UnsupportedImageFormat}
 */
export async function ensureDerivedImage({
  filename
, format
, quality
, maxHeight
, maxWidth
, multiple
}: {
  filename: string
  format: 'jpeg' | 'webp'
  quality: number
  maxWidth?: number
  maxHeight?: number
  multiple?: number
}): Promise<string> {
  const absoluteFilename = getAbsoluteFilename(filename)
  const [err, metadata] = await getErrorResultAsync(() => readImageMetadata(absoluteFilename))
  if (err) {
    if (err.message.includes('Input file is missing')) throw new NotFound()
    if (err.message.includes('Input file contains unsupported image format')) {
      throw new UnsupportedImageFormat()
    }
    throw err
  }
  assert(isntUndefined(metadata))

  const size = computeTargetSize(metadata.size, {
    maxHeight
  , maxWidth
  , multiple
  })
  const target = {
    filename
  , format
  , quality
  , height: size.height
  , width: size.width
  }

  if (!targetToLock.has(target)) {
    targetToLock.set(target, {
      mutex: new Mutex()
    , users: 0
    })
  }
  const lock = targetToLock.get(target)!
  lock.users++
  try {
    return await lock.mutex.acquire(async () => {
      const uuid = await StaticDAO.findDerivedImage(absoluteFilename, target)

      if (uuid) {
        if (await pathExists(getDerviedImageFilename(uuid))) {
          return uuid
        }
      }

      const newUUID = createUUID()
      const writeStream = createWriteStream(getDerviedImageFilename(newUUID))
      await pipeline(processImage(absoluteFilename, target), writeStream)
      await StaticDAO.setDerivedImage(newUUID, filename, target)
      return newUUID
    })
  } finally {
    if (--lock.users === 0) targetToLock.delete(target)
  }
}

function getAbsoluteFilename(filename: string): string {
  return path.join(STORAGE(), 'files', filename)
}

function getDerviedImageFilename(uuid: string): string {
  return path.join(STORAGE(), 'derived-images', uuid)
}
