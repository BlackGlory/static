import { getDatabase } from '../database'

export function setDerivedImage(
  uuid: string
, filename: string
, mtime: number
, metadata: IDerivedImageMetadata
): void {
  getDatabase().prepare(`
    INSERT INTO derived_image (uuid, filename, mtime, format, quality, width, height)
    VALUES ($uuid, $filename, $mtime, $format, $quality, $width, $height)
        ON CONFLICT(filename, mtime, format, quality, width, height)
        DO UPDATE SET uuid = $uuid
  `).run({ uuid, filename, mtime, ...metadata })
}
