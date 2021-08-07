import * as path from 'path'
import { STORAGE } from '@env'
import { DerviedFontDAO } from '@dao/data-in-sqlite3/derived-font'
import { pathExists, remove } from 'extra-filesystem'
import { v4 as createUUID } from 'uuid'
import { go } from '@blackglory/go'
import { HashMap } from '@blackglory/structures'
import { Mutex, each } from 'extra-promise'
import stringify from 'fast-json-stable-stringify'
import { processFont } from './font'
import { getAbsoluteFilename, getMtimestamp } from './utils'
import { NotFound, UnsupportedFontFormat } from './errors'

const targetToLock = new HashMap<
  { filename: string; metadata: IDerivedFontMetadata }
, { mutex: Mutex; users: number }
>(stringify)

/**
 * @throws {NotFound} 
 * @throws {UnsupportedFontFormat}
 */
export async function ensureDerivedFont({
  filename
, format
, subset
}: {
  filename: string
  format: 'woff' | 'woff2'
  subset: string
}) {
  const absoluteFilename = getAbsoluteFilename(filename)

  const mtime = await go(async () => {
    try {
      return await getMtimestamp(absoluteFilename)
    } catch (e) {
      if (e.code === 'ENOENT') throw new NotFound()
      throw e
    }
  })

  const derivedFontMetadata: IDerivedFontMetadata = {
    format
  , subset: DerviedFontDAO.normalizeSubset(subset)
  }

  // 使用互斥锁是为了防止短时间内出现多个目标相同的生成操作,
  // 以免数据库记录的覆盖(setDerivedFont)导致dervied-fonts目录出现不记载于数据库中的孤儿文件.
  const target = { filename, metadata: derivedFontMetadata }
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
      const uuid = await DerviedFontDAO.findDerivedFont(
        filename
      , mtime
      , derivedFontMetadata
      )

      if (uuid) {
        if (await pathExists(getDerivedFontFilename(uuid))) {
          return uuid
        }
      }

      const newUUID = createUUID()
      try {
        await processFont(
          absoluteFilename
        , getDerivedFontFilename(newUUID)
        , derivedFontMetadata
        )
      } catch (e) {
        if (e.message.includes('Not a TrueType or OpenType font (not enough data)')) {
          throw new UnsupportedFontFormat()
        }
        throw e
      }
      await DerviedFontDAO.setDerivedFont(
        newUUID
      , filename
      , mtime
      , derivedFontMetadata
      )

      const outdatedUUIDs = await DerviedFontDAO.removeOutdatedDerivedFonts(
        filename
      , mtime
      )
      await each(outdatedUUIDs, uuid => remove(getDerivedFontFilename(uuid)))

      return newUUID
    })
  } finally {
    if (--lock.users === 0) targetToLock.delete(target)
  }
}

export function getDerivedFontFilename(uuid: string): string {
  return path.join(STORAGE(), 'derived-fonts', uuid)
}