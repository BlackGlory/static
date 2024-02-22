import { setDerivedFont } from './set-derived-font.js'
import { findDerivedFont } from './find-derived-font.js'
import { removeDerivedFont } from './remove-derived-font.js'
import { removeOutdatedDerivedFonts } from './remove-outdated-derived-fonts.js'
import { normalizeSubset } from './normalize-subset.js'
import { IDerivedFontDAO } from './contract.js'

export const DerviedFontDAO: IDerivedFontDAO = {
  normalizeSubset
, setDerivedFont
, findDerivedFont
, removeDerivedFont
, removeOutdatedDerivedFonts
}
