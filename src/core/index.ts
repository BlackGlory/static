import { validateSignature } from './signature.js'
import { ensureDerivedImage, getDerivedImageFilename } from './derived-image.js'
import { ensureDerivedFont, getDerivedFontFilename } from './derived-font.js'
import { NotFound, UnsupportedImageFormat, UnsupportedFontFormat } from './errors.js'

export const Core: ICore = {
  validateSignature

, ensureDerivedFont
, getDerivedFontFilename

, ensureDerivedImage
, getDerivedImageFilename

, NotFound
, UnsupportedImageFormat
, UnsupportedFontFormat
}
