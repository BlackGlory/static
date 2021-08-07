import { validateSignature } from './signature'
import { ensureDerivedImage, getDerivedImageFilename } from './derived-image'
import { ensureDerivedFont, getDerivedFontFilename } from './derived-font'
import { NotFound, UnsupportedImageFormat, UnsupportedFontFormat } from './errors'

export const Core: ICore = {
  validateSignature
, ensureDerivedImage
, ensureDerivedFont
, getDerivedImageFilename
, getDerivedFontFilename

, NotFound
, UnsupportedImageFormat
, UnsupportedFontFormat
}
