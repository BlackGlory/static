import { getDatabase } from '../database.js'
import { withLazyStatic, lazyStatic } from 'extra-lazy'
import { IDerivedImageMetadata } from '@api/contract.js'

export const setDerivedImage = withLazyStatic(function (
  uuid: string
, filename: string
, mtime: number
, metadata: IDerivedImageMetadata
): void {
  lazyStatic(() => getDatabase().prepare(`
    INSERT INTO derived_image (uuid, filename, mtime, format, quality, width, height)
    VALUES ($uuid, $filename, $mtime, $format, $quality, $width, $height)
        ON CONFLICT(filename, mtime, format, quality, width, height)
        DO UPDATE SET uuid = $uuid
  `), [getDatabase()]).run({ uuid, filename, mtime, ...metadata })
})
