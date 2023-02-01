import { getDatabase } from '@dao/data/database.js'

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

export function getRawDerivedFont(uuid: string): IRawDerivedFont | undefined {
  const row = getDatabase().prepare(`
    SELECT *
      FROM derived_font
     WHERE uuid = $uuid
  `).get({ uuid }) as IRawDerivedFont | undefined

  return row
}

export function hasRawDerviedFont(uuid: string): boolean {
  return !!getRawDerivedFont(uuid)
}
