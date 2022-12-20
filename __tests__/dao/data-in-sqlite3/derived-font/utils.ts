import { getDatabase } from '@dao/data-in-sqlite3/database.js'

interface IRawDerivedFont {
  uuid: string
  filename: string
  mtime: number
  format: string
  subset: string
}

export function setRawDerivedFont(raw: IRawDerivedFont): IRawDerivedFont {
  getDatabase().prepare(`
    INSERT INTO derived_font (uuid, filename, mtime, format, subset)
    VALUES ($uuid, $filename, $mtime, $format, $subset)
  `).run(raw)

  return raw
}

export function getRawDerivedFont(uuid: string): IRawDerivedFont {
  const row = getDatabase().prepare(`
    SELECT uuid
         , filename
         , mtime
         , format
         , subset
      FROM derived_font
     WHERE uuid = $uuid
  `).get({ uuid })

  return row
}

export function hasRawDerviedFont(uuid: string): boolean {
  return !!getRawDerivedFont(uuid)
}
