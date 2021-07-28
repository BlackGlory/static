type CustomErrorConstructor = import('@blackglory/errors').CustomErrorConstructor

interface IImageMetadata {
  format: string
  quality: number
  width: number
  height: number
}

interface ICore {
  validateSignature(signature: string, params: Record<string, unknown>): boolean

  /**
   * @throws {NotFound} 
   * @throws {UnsupportedImageFormat}
   */
  ensureDerivedImage(params: {
    filename: string
    format: 'jpeg' | 'webp'
    quality: number
    maxWidth?: number
    maxHeight?: number
    multiple?: number
  }): Promise<string>

  NotFound: CustomErrorConstructor
  UnsupportedImageFormat: CustomErrorConstructor
}
