import { getDatabase } from '../database.js'
import { withLazyStatic, lazyStatic } from 'extra-lazy'
import { IDerivedImageMetadata } from './contract.js'

export const findDerivedImage = withLazyStatic(function (
  filename: string
, mtime: number
, metadata: IDerivedImageMetadata
): string | null {
  const row = lazyStatic(() => getDatabase().prepare(`
    SELECT uuid
      FROM derived_image
     WHERE filename = $filename
       AND mtime = $mtime
       AND format = $format
       AND quality = $quality
       AND width = $width
       AND height = $height
  `), [getDatabase()])
    .get({ filename, mtime, ...metadata }) as { uuid: string } | undefined

  return row?.uuid ?? null
})
