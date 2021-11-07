import { validateSignature } from './signature'
import { ensureDerivedImage, getDerivedImageFilename } from './derived-image'
import { ensureDerivedFont, getDerivedFontFilename } from './derived-font'
import { NotFound, UnsupportedImageFormat, UnsupportedFontFormat } from './errors'

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
