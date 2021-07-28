import { getDatabase } from '@dao/data-in-sqlite3/database'

interface IRawDerivedImage {
  uuid: string
  filename: string
  format: string
  quality: number
  width: number
  height: number
}

export function setRawDerivedImage(raw: IRawDerivedImage): IRawDerivedImage {
  getDatabase().prepare(`
    INSERT INTO derived_image (uuid, filename, format, quality, width, height)
    VALUES ($uuid, $filename, $format, $quality, $width, $height)
  `).run(raw)

  return raw
}

export function getRawDerivedImage(uuid: string): IRawDerivedImage {
  const row = getDatabase().prepare(`
    SELECT uuid
         , filename
         , format
         , quality
         , width
         , height
      FROM derived_image
     WHERE uuid = $uuid
  `).get({ uuid })

  return row
}

export function hasRawDerviedImage(uuid: string): boolean {
  return !!getRawDerivedImage(uuid)
}
