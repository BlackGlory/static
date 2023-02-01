import { getDatabase } from '../database.js'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export const removeOutdatedDerivedImages = withLazyStatic(function (
  filename: string
, newMtime: number
): string[] {
  return lazyStatic(() => getDatabase().transaction((
    filename: string
  , newMtime: number
  ) => {
    const rows: Array<{ uuid: string }> = lazyStatic(() => getDatabase().prepare(`
      SELECT uuid
        FROM derived_image
       WHERE filename = $filename
         AND mtime != $newMtime
    `), [getDatabase()]).all({ filename, newMtime })

    lazyStatic(() => getDatabase().prepare(`
      DELETE FROM derived_image
       WHERE filename = $filename
         AND mtime != $newMtime
    `), [getDatabase()]).run({ filename, newMtime })

    return rows.map(row => row['uuid'])
  }), [getDatabase()])(filename, newMtime)
})
