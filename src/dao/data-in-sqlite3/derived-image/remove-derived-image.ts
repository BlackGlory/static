import { getDatabase } from '../database'

export function removeDerivedImage(uuid: string): void {
  getDatabase().prepare(`
    DELETE FROM derived_image
     WHERE uuid = $uuid
  `).run({ uuid })
}
