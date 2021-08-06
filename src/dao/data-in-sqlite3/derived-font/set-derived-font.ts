import { getDatabase } from '../database'
import { normalizeSubset } from './normalize-subset'

export function setDerivedFont(
  uuid: string
, filename: string
, mtime: number
, metadata: IDerivedFontMetadata
): void {
  getDatabase().prepare(`
    INSERT INTO derived_font (uuid, filename, mtime, format, subset)
    VALUES ($uuid, $filename, $mtime, $format, $subset) 
        ON CONFLICT(filename, mtime, format, subset) 
        DO UPDATE SET uuid = $uuid
  `).run({
    uuid
  , filename
  , mtime
  , format: metadata.format
  , subset: normalizeSubset(metadata.subset)
  })
}
