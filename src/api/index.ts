import { validateSignature } from './signature.js'
import { ensureDerivedImage, getDerivedImageFilename } from './derived-image.js'
import { ensureDerivedFont, getDerivedFontFilename } from './derived-font.js'
import { NotFound, UnsupportedImageFormat, UnsupportedFontFormat } from './errors.js'
import { IAPI } from './contract.js'

export const api: IAPI = {
  validateSignature

, ensureDerivedFont
, getDerivedFontFilename

, ensureDerivedImage
, getDerivedImageFilename

, NotFound
, UnsupportedImageFormat
, UnsupportedFontFormat
}
