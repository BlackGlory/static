import { setDerivedImage } from './set-derived-image'
import { findDerivedImage } from './find-derived-image'
import { removeDerivedImage } from './remove-derived-image'
import { removeOutdatedDerivedImages } from './remove-outdated-derived-images'

export const DerivedImageDAO: IDerivedImageDAO = {
  setDerivedImage: asyncify(setDerivedImage)
, findDerivedImage: asyncify(findDerivedImage)
, removeDerivedImage: asyncify(removeDerivedImage)
, removeOutdatedDerivedImages: asyncify(removeOutdatedDerivedImages)
}

function asyncify<T extends any[], U>(fn: (...args: T) => U): (...args: T) => Promise<U> {
  return async function (this: unknown, ...args: T): Promise<U> {
    return Reflect.apply(fn, this, args)
  }
}
