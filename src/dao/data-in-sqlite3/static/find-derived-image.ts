import { getDatabase } from '../database'

export function findDerivedImage(filename: string, metadata: IImageMetadata): string | null {
  const row: { uuid: string } | null = getDatabase().prepare(`
    SELECT uuid
      FROM derived_image
     WHERE filename = $filename
       AND format = $format
       AND quality = $quality
       AND width = $width
       AND height = $height
  `).get({ filename, ...metadata })

  return row?.uuid ?? null
}
