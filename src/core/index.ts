import { validateSignature } from './signature'
import { ensureDerivedImage } from './derived-image'
import { ensureDerivedFont } from './derived-font'
import { NotFound, UnsupportedImageFormat, UnsupportedFontFormat } from './errors'

export const Core: ICore = {
  validateSignature
, ensureDerivedImage
, ensureDerivedFont

, NotFound
, UnsupportedImageFormat
, UnsupportedFontFormat
}
