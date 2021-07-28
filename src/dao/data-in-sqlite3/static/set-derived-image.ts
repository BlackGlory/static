import { getDatabase } from '../database'

export function setDerivedImage(
  uuid: string
, filename: string
, metadata: IImageMetadata
): void {
  getDatabase().prepare(`
    INSERT INTO derived_image (uuid, filename, format, quality, width, height)
    VALUES ($uuid, $filename, $format, $quality, $width, $height)
        ON CONFLICT(filename, format, quality, width, height)
        DO UPDATE SET uuid = $uuid
  `).run({ uuid, filename, ...metadata })
}
