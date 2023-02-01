import { getDatabase } from '../database.js'
import { normalizeSubset } from './normalize-subset.js'
import { withLazyStatic, lazyStatic } from 'extra-lazy'
import { IDerivedFontMetadata } from './contract.js'

export const findDerivedFont = withLazyStatic(function (
  filename: string
, mtime: number
, metadata: IDerivedFontMetadata
): string | null {
  const row = lazyStatic(() => getDatabase().prepare(`
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
  }) as { uuid: string } | undefined

  return row?.uuid ?? null
})
