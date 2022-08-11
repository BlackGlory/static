import { getDatabase } from '../database'
import { normalizeSubset } from './normalize-subset'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export const setDerivedFont = withLazyStatic(function (
  uuid: string
, filename: string
, mtime: number
, metadata: IDerivedFontMetadata
): void {
  lazyStatic(() => getDatabase().prepare(`
    INSERT INTO derived_font (uuid, filename, mtime, format, subset)
    VALUES ($uuid, $filename, $mtime, $format, $subset) 
        ON CONFLICT(filename, mtime, format, subset) 
        DO UPDATE SET uuid = $uuid
  `), [getDatabase()]).run({
    uuid
  , filename
  , mtime
  , format: metadata.format
  , subset: normalizeSubset(metadata.subset)
  })
})
