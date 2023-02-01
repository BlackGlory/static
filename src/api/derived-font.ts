import * as path from 'path'
import { STORAGE } from '@env/index.js'
import { DerviedFontDAO } from '@dao/data/derived-font/index.js'
import { pathExists, remove, move } from 'extra-filesystem'
import { v4 as createUUID } from 'uuid'
import { reusePendingPromises, each } from 'extra-promise'
import { processFont } from './font.js'
import { getStaticFilename, getMtimestamp } from './utils.js'
import { UnsupportedFontFormat } from './errors.js'
import { assert } from '@blackglory/errors'
import { isObject, isString } from '@blackglory/prelude'
import { readdir } from 'fs/promises'
import { IDerivedFontMetadata } from './contract.js'

/**
 * @throws {NotFound}
 * @throws {UnsupportedFontFormat}
 */
export const ensureDerivedFont = reusePendingPromises(
  async function ensureDerivedFont({
    filename
  , format
  , subset
  }: {
    filename: string
    format: 'woff' | 'woff2'
    subset: string
  }): Promise<string> {
    const absoluteFilename = getStaticFilename(filename)

    const mtime = await getMtimestamp(absoluteFilename)

    const derivedFontMetadata: IDerivedFontMetadata = {
      format
    , subset: DerviedFontDAO.normalizeSubset(subset)
    }

    return _ensureDerivedFont(filename, mtime, derivedFontMetadata)
  }
)

const _ensureDerivedFont = reusePendingPromises(
  async function _ensureDerivedFont(
    filename: string
  , mtime: number
  , derivedFontMetadata: IDerivedFontMetadata
  ): Promise<string> {
    const uuid = await DerviedFontDAO.findDerivedFont(
      filename
    , mtime
    , derivedFontMetadata
    )
    if (uuid && await pathExists(getDerivedFontFilename(uuid))) return uuid

    const absoluteFilename = getStaticFilename(filename)
    const newUUID = createUUID()
    const newDerivedFilename = getDerivedFontFilename(newUUID)
    const tempFilename = `${newDerivedFilename}.tmp`
    try {
      await processFont(
        absoluteFilename
      , tempFilename 
      , derivedFontMetadata
      )
    } catch (e) {
      assert(isObject(e) && isString(e.message), 'e.message must be string')
      if (e.message.includes('Not a TrueType or OpenType font (not enough data)')) {
        throw new UnsupportedFontFormat()
      }
      throw e
    }
    await move(tempFilename, newDerivedFilename)
    await DerviedFontDAO.setDerivedFont(
      newUUID
    , filename
    , mtime
    , derivedFontMetadata
    )

    await removeOutdatedDerivedFonts()

    return newUUID

    async function removeOutdatedDerivedFonts() {
      const outdatedUUIDs = await DerviedFontDAO.removeOutdatedDerivedFonts(
        filename
      , mtime
      )
      await each(outdatedUUIDs, uuid => remove(getDerivedFontFilename(uuid)))
    }
  }
)

export function getDerivedFontFilename(uuid: string): string {
  return path.join(getDerivedFontDirectory(), uuid)
}

export async function clearAllTemporaryDerivedFonts(): Promise<void> {
  const filenames = await readdir(getDerivedFontDirectory())
  const tempFilenames = filenames
    .filter(x => x.endsWith('.tmp'))
    .map(x => path.join(getDerivedFontDirectory(), x))

  await each(tempFilenames, x => remove(x))
}

export function getDerivedFontDirectory(): string {
  return path.join(STORAGE(), 'derived-fonts')
}
