import { getDatabase } from '../database'

export function removeDerivedFont(uuid: string): void {
  getDatabase().prepare(`
    DELETE FROM derived_font
     WHERE uuid = $uuid
  `).run({ uuid })
}
