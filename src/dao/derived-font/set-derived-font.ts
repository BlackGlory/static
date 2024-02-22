import { getDatabase } from '../database.js'
import { normalizeSubset } from './normalize-subset.js'
import { withLazyStatic, lazyStatic } from 'extra-lazy'
import { IDerivedFontMetadata } from './contract.js'

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
