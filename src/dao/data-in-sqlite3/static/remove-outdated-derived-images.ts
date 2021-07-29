import { getDatabase } from '../database'

export function removeOutdatedDerivedImages(filename: string, newMtime: number): string[] {
  return getDatabase().transaction(() => {
    const rows: Array<{ uuid: string }> = getDatabase().prepare(`
      SELECT uuid
        FROM derived_image
       WHERE filename = $filename
         AND mtime != $newMtime
    `).all({ filename, newMtime })

    getDatabase().prepare(`
      DELETE FROM derived_image
       WHERE filename = $filename
         AND mtime != $newMtime
    `).run({ filename, newMtime })

    return rows.map(row => row['uuid'])
  })()
}
