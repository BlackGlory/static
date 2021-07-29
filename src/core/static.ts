import { computeTargetSize, processImage, readImageMetadata } from './image'
import { StaticDAO } from '@dao/data-in-sqlite3/static'
import { STORAGE } from '@env'
import { pathExists, remove } from 'extra-filesystem'
import * as path from 'path'
import { Mutex, each } from 'extra-promise'
import { v4 as createUUID } from 'uuid'
import { createWriteStream } from 'fs'
import * as fs from 'fs/promises'
import stringify from 'fast-json-stable-stringify'
import { promisify } from 'util'
import * as stream from 'stream'
import { HashMap } from '@blackglory/structures'
import { CustomError } from '@blackglory/errors'
import { go } from '@blackglory/go'

export class NotFound extends CustomError {}
export class UnsupportedImageFormat extends CustomError {}

const pipeline = promisify(stream.pipeline)
const targetToLock = new HashMap<
  { filename: string; metadata: IDerivedImageMetadata }
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

  const mtime = await go(async () => {
    try {
      return await getMtimestamp(absoluteFilename)
    } catch (e) {
      if (e.code === 'ENOENT') throw new NotFound()
      throw e
    }
  })
  const imageMetadata = await go(async () => {
    try {
      return await readImageMetadata(absoluteFilename)
    } catch (e) {
      if (e.message.includes('Input file is missing')) throw new NotFound()
      if (e.message.includes('Input file contains unsupported image format')) {
        throw new UnsupportedImageFormat()
      }
      throw e
    }
  })

  const size = computeTargetSize(imageMetadata.size, {
    maxHeight
  , maxWidth
  , multiple
  })
  const derivedImageMetadata: IDerivedImageMetadata = {
    format
  , quality
  , height: size.height
  , width: size.width
  }

  // 使用互斥锁是为了防止短时间内出现多个目标相同的生成操作,
  // 以免数据库记录的覆盖(setDerivedImage)导致dervied-images目录出现不记载于数据库中的孤儿文件.
  const target = { filename, metadata: derivedImageMetadata }
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
      const uuid = await StaticDAO.findDerivedImage(absoluteFilename, mtime, derivedImageMetadata)

      if (uuid) {
        if (await pathExists(getDerviedImageFilename(uuid))) {
          return uuid
        }
      }

      const newUUID = createUUID()
      const writeStream = createWriteStream(getDerviedImageFilename(newUUID))
      await pipeline(processImage(absoluteFilename, derivedImageMetadata), writeStream)
      await StaticDAO.setDerivedImage(newUUID, filename, mtime, derivedImageMetadata)

      const outdatedUUIDs = await StaticDAO.removeOutdatedDerivedImages(filename, mtime)
      await each(outdatedUUIDs, uuid => remove(getDerviedImageFilename(uuid)))

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

async function getMtimestamp(filename: string): Promise<number> {
  const result = await fs.stat(filename)
  return Math.floor(result.mtime.getTime() / 1000)
}
