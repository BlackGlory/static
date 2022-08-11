import { getDatabase } from '../database'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export const removeDerivedFont = withLazyStatic(function (uuid: string): void {
  lazyStatic(() => getDatabase().prepare(`
    DELETE FROM derived_font
     WHERE uuid = $uuid
  `), [getDatabase()]).run({ uuid })
})
