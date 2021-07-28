import { setDerivedImage } from './set-derived-image'
import { removeDerivedImage } from './remove-derived-image'
import { findDerivedImage } from './find-derived-image'

export const StaticDAO: IStaticDAO = {
  setDerivedImage: asyncify(setDerivedImage)
, removeDerivedImage: asyncify(removeDerivedImage)
, findDerivedImage: asyncify(findDerivedImage)
}

function asyncify<T extends any[], U>(fn: (...args: T) => U): (...args: T) => Promise<U> {
  return async function (this: unknown, ...args: T): Promise<U> {
    return Reflect.apply(fn, this, args)
  }
}
