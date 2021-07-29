import { getDatabase } from '../database'

export function findDerivedImage(
  filename: string
, mtime: number
, metadata: IDerivedImageMetadata
): string | null {
  const row: { uuid: string } | null = getDatabase().prepare(`
    SELECT uuid
      FROM derived_image
     WHERE filename = $filename
       AND mtime = $mtime
       AND format = $format
       AND quality = $quality
       AND width = $width
       AND height = $height
  `).get({ filename, mtime, ...metadata })

  return row?.uuid ?? null
}
