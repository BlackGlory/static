import { computeTargetSize, processImage, readImageMetadata } from './image.js'
import { DerivedImageDAO } from '@dao/derived-image/index.js'
import { STORAGE } from '@env/index.js'
import { pathExists, remove, move } from 'extra-filesystem'
import * as path from 'path'
import { reusePendingPromises, each } from 'extra-promise'
import { v4 as createUUID } from 'uuid'
import { go } from '@blackglory/prelude'
import { getStaticFilename, getMtimestamp } from './utils.js'
import { NotFound, UnsupportedImageFormat } from './errors.js'
import { assert } from '@blackglory/errors'
import { isObject, isString } from '@blackglory/prelude'
import { readdir } from 'fs/promises'
import { IDerivedImageMetadata } from './contract.js'

/**
 * @throws {NotFound} 
 * @throws {UnsupportedImageFormat}
 */
export const ensureDerivedImage = reusePendingPromises(
  async function ensureDerivedImage({
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
    const absoluteFilename = getStaticFilename(filename)
    const mtime = await getMtimestamp(absoluteFilename)

    const imageMetadata = await go(async () => {
      try {
        return await readImageMetadata(absoluteFilename)
      } catch (e) {
        assert(isObject(e) && isString(e.message), 'e.message must be string')
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

    return await _ensureDerivedImage(filename, mtime, derivedImageMetadata)
  }
)

const _ensureDerivedImage = reusePendingPromises(
  async function _ensureDerivedImage(
    filename: string
  , mtime: number
  , derivedImageMetadata: IDerivedImageMetadata
  ): Promise<string> {
    const uuid = DerivedImageDAO.findDerivedImage(
      filename
    , mtime
    , derivedImageMetadata
    )
    if (uuid && await pathExists(getDerivedImageFilename(uuid))) return uuid

    const absoluteFilename = getStaticFilename(filename)
    const newUUID = createUUID()
    const newDerivedFilename = getDerivedImageFilename(newUUID)
    const tempFilename = `${newDerivedFilename}.tmp`
    await processImage(absoluteFilename, tempFilename, derivedImageMetadata)
    await move(tempFilename, newDerivedFilename)
    DerivedImageDAO.setDerivedImage(
      newUUID
    , filename
    , mtime
    , derivedImageMetadata
    )

    await removeOutdatedDerivedImages()

    return newUUID

    async function removeOutdatedDerivedImages(): Promise<void> {
      const outdatedUUIDs = DerivedImageDAO.removeOutdatedDerivedImages(
        filename
      , mtime
      )
      await each(outdatedUUIDs, uuid => remove(getDerivedImageFilename(uuid)))
    }
  }
)

export function getDerivedImageFilename(uuid: string): string {
  return path.join(getDerivedImageDirectory(), uuid)
}

export async function clearAllTemporaryDerivedImages(): Promise<void> {
  const filenames = await readdir(getDerivedImageDirectory())
  const tempFilenames = filenames
    .filter(x => x.endsWith('.tmp'))
    .map(x => path.join(getDerivedImageDirectory(), x))

  await each(tempFilenames, x => remove(x))
}

export function getDerivedImageDirectory(): string {
  return path.join(STORAGE(), 'derived-images')
}
