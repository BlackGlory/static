import { getDatabase } from '../database.js'
import { normalizeSubset } from './normalize-subset.js'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export const findDerivedFont = withLazyStatic(function (
  filename: string
, mtime: number
, metadata: IDerivedFontMetadata
): string | null {
  const row: { uuid: string } | null = lazyStatic(() => getDatabase().prepare(`
    SELECT uuid
      FROM derived_font
     WHERE filename = $filename
       AND mtime = $mtime
       AND format = $format
       AND subset = $subset
  `), [getDatabase()]).get({
    filename
  , mtime
  , format: metadata.format
  , subset: normalizeSubset(metadata.subset)
  })

  return row?.uuid ?? null
})
