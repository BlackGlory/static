import { computeTargetSize, processImage, readImageMetadata } from './image'
import { DerivedImageDAO } from '@dao/data-in-sqlite3/derived-image'
import { STORAGE } from '@env'
import { pathExists, remove, move } from 'extra-filesystem'
import * as path from 'path'
import { Mutex, each } from 'extra-promise'
import { v4 as createUUID } from 'uuid'
import stringify from 'fast-json-stable-stringify'
import { HashMap } from '@blackglory/structures'
import { go } from '@blackglory/go'
import { getAbsoluteFilename, getMtimestamp } from './utils'
import { NotFound, UnsupportedImageFormat } from './errors'
import { assert } from '@blackglory/errors'
import { isRecord, isString } from '@blackglory/types'

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
      assert(isRecord(e))
      if (e.code === 'ENOENT') throw new NotFound()
      throw e
    }
  })
  const imageMetadata = await go(async () => {
    try {
      return await readImageMetadata(absoluteFilename)
    } catch (e) {
      assert(isRecord(e) && isString(e.message))
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
      const uuid = await DerivedImageDAO.findDerivedImage(
        filename
      , mtime
      , derivedImageMetadata
      )

      if (uuid) {
        if (await pathExists(getDerivedImageFilename(uuid))) {
          return uuid
        }
      }

      const newUUID = createUUID()
      const newDerivedFilename = getDerivedImageFilename(newUUID)
      const tempFilename = `${newDerivedFilename}.tmp`
      await processImage(absoluteFilename, tempFilename, derivedImageMetadata)
      await move(tempFilename, newDerivedFilename)
      await DerivedImageDAO.setDerivedImage(
        newUUID
      , filename
      , mtime
      , derivedImageMetadata
      )

      const outdatedUUIDs = await DerivedImageDAO.removeOutdatedDerivedImages(
        filename
      , mtime
      )
      await each(outdatedUUIDs, uuid => remove(getDerivedImageFilename(uuid)))

      return newUUID
    })
  } finally {
    if (--lock.users === 0) targetToLock.delete(target)
  }
}

export function getDerivedImageFilename(uuid: string): string {
  return path.join(STORAGE(), 'derived-images', uuid)
}
