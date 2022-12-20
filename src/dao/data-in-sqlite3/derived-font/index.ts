import { setDerivedFont } from './set-derived-font.js'
import { findDerivedFont } from './find-derived-font.js'
import { removeDerivedFont } from './remove-derived-font.js'
import { removeOutdatedDerivedFonts } from './remove-outdated-derived-fonts.js'
import { normalizeSubset } from './normalize-subset.js'

export const DerviedFontDAO: IDerivedFontDAO = {
  normalizeSubset
, setDerivedFont: asyncify(setDerivedFont)
, findDerivedFont: asyncify(findDerivedFont)
, removeDerivedFont: asyncify(removeDerivedFont)
, removeOutdatedDerivedFonts: asyncify(removeOutdatedDerivedFonts)
}

function asyncify<T extends any[], U>(fn: (...args: T) => U): (...args: T) => Promise<U> {
  return async function (this: unknown, ...args: T): Promise<U> {
    return Reflect.apply(fn, this, args)
  }
}
