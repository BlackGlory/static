import sharp from 'sharp'
import { assert } from '@blackglory/errors'
import { isntUndefined } from '@blackglory/types'

interface ISize {
  width: number
  height: number
}

interface IMetadata {
  size: ISize
  format: string
}

export async function readImageMetadata(filename: string): Promise<IMetadata> {
  const metadata = await sharp(filename).metadata()
  assert(isntUndefined(metadata.format))
  assert(isntUndefined(metadata.height))
  assert(isntUndefined(metadata.width))

  return {
    format: metadata.format
  , size: {
      height: metadata.height
    , width: metadata.width
    }
  }
}

export function computeTargetSize(
  size: ISize
, { maxWidth, maxHeight, multiple }: {
    /**
     * 一个合法的查询如果同时提供了maxHeight和maxWidth, 则会依缩放比更大的那一边进行缩放.
     */
    maxWidth?: number
    maxHeight?: number

    /**
     * 缩放倍率, 提供了此属性, 则maxHeight和maxWidth都会无效
     */ 
    multiple?: number
  }
): ISize {
  if (multiple) {
    return computeScaledSize(size, multiple)
  } else {
    return computeDownscaledSize(
      size
    , maxWidth ?? size.width
    , maxHeight ?? size.height
    )
  }
}

export function processImage(
  input: string
, { format, quality, width, height }: {
    format: 'jpeg' | 'webp'
    quality: number
    width: number
    height: number
  }
): NodeJS.ReadableStream {
  return sharp(input)
    .resize(width, height, { fit: 'fill' })
    .toFormat(format, { quality })
}

function computeDownscaledSize(
  originalSize: ISize
, maxWidth: number
, maxHeight: number
): ISize {
  if (originalSize.height <= maxHeight
  &&  originalSize.width <= maxWidth) {
    return originalSize
  }

  const scale = Math.min(
    maxWidth / originalSize.width
  , maxHeight / originalSize.height
  )
  return computeScaledSize(originalSize, scale)
}

function computeScaledSize(originalSize: ISize, multiple: number): ISize {
  return {
    width: Math.ceil(originalSize.width * multiple)
  , height: Math.ceil(originalSize.height * multiple)
  }
}
