import { getDatabase } from '../database'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export const removeDerivedImage = withLazyStatic(function (uuid: string): void {
  lazyStatic(() => getDatabase().prepare(`
    DELETE FROM derived_image
     WHERE uuid = $uuid
  `), [getDatabase()]).run({ uuid })
})
