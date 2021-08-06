import { setDerivedFont } from './set-derived-font'
import { findDerivedFont } from './find-derived-font'
import { removeDerivedFont } from './remove-derived-font'
import { removeOutdatedDerivedFonts } from './remove-outdated-derived-fonts'
import { normalizeSubset } from './normalize-subset'

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
