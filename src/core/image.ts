import sharp from 'sharp'
import { assert } from '@blackglory/errors'
import { isntUndefined } from '@blackglory/types'
import { createWriteStream } from 'fs'
import { promisify } from 'util'
import * as stream from 'stream'

const pipeline = promisify(stream.pipeline)

interface ISize {
  width: number
  height: number
}

export async function readImageMetadata(filename: string): Promise<{
  size: ISize
  format: string
}> {
  const metadata = await sharp(filename).metadata()
  assert(isntUndefined(metadata.format), 'metadata.format must be defined')
  assert(isntUndefined(metadata.height), 'metadata.height must be defined')
  assert(isntUndefined(metadata.width), 'metadata.width must be defined')

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

export async function processImage(
  inputFilename: string
, outputFilename: string
, { format, quality, width, height }: {
    format: 'jpeg' | 'webp'
    quality: number
    width: number
    height: number
  }
): Promise<void> {
  const stream = sharp(inputFilename)
    .resize(width, height, { fit: 'fill' })
    .toFormat(format, { quality })

  await pipeline(stream, createWriteStream(outputFilename))
}

function computeDownscaledSize(
  originalSize: ISize
, maxWidth: number
, maxHeight: number
): ISize {
  if (
    originalSize.height <= maxHeight &&
    originalSize.width <= maxWidth
  ) {
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
