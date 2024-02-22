import { setDerivedImage } from './set-derived-image.js'
import { findDerivedImage } from './find-derived-image.js'
import { removeDerivedImage } from './remove-derived-image.js'
import { removeOutdatedDerivedImages } from './remove-outdated-derived-images.js'
import { IDerivedImageDAO } from './contract.js'

export const DerivedImageDAO: IDerivedImageDAO = {
  setDerivedImage
, findDerivedImage
, removeDerivedImage
, removeOutdatedDerivedImages
}
