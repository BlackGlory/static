import { getDatabase } from '../database'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export const findDerivedImage = withLazyStatic(function (
  filename: string
, mtime: number
, metadata: IDerivedImageMetadata
): string | null {
  const row: { uuid: string } | null = lazyStatic(() => getDatabase().prepare(`
    SELECT uuid
      FROM derived_image
     WHERE filename = $filename
       AND mtime = $mtime
       AND format = $format
       AND quality = $quality
       AND width = $width
       AND height = $height
  `), [getDatabase()]).get({ filename, mtime, ...metadata })

  return row?.uuid ?? null
})
