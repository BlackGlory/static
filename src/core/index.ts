import { validateSignature } from './signature'
import { ensureDerivedImage, NotFound, UnsupportedImageFormat } from './static'

export const Core: ICore = {
  validateSignature
, ensureDerivedImage

, NotFound
, UnsupportedImageFormat
}
