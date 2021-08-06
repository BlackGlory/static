import { getDatabase } from '../database'
import { normalizeSubset } from './normalize-subset'

export function findDerivedFont(
  filename: string
, mtime: number
, metadata: IDerivedFontMetadata
): string | null {
  const row: { uuid: string } | null = getDatabase().prepare(`
    SELECT uuid
      FROM derived_font
     WHERE filename = $filename
       AND mtime = $mtime
       AND format = $format
       AND subset = $subset
  `).get({
    filename
  , mtime
  , format: metadata.format
  , subset: normalizeSubset(metadata.subset)
  })

  return row?.uuid ?? null
}
