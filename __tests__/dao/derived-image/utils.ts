import { getDatabase } from '@dao/database.js'

interface IRawDerivedImage {
  uuid: string
  filename: string
  mtime: number
  format: string
  quality: number
  width: number
  height: number
}

export function setRawDerivedImage(raw: IRawDerivedImage): IRawDerivedImage {
  getDatabase().prepare(`
    INSERT INTO derived_image (uuid, filename, mtime, format, quality, width, height)
    VALUES ($uuid, $filename, $mtime, $format, $quality, $width, $height)
  `).run(raw)

  return raw
}

export function getRawDerivedImage(uuid: string): IRawDerivedImage | undefined {
  const row = getDatabase().prepare(`
    SELECT *
      FROM derived_image
     WHERE uuid = $uuid
  `).get({ uuid }) as IRawDerivedImage | undefined

  return row
}

export function hasRawDerviedImage(uuid: string): boolean {
  return !!getRawDerivedImage(uuid)
}
