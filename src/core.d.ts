type CustomErrorConstructor = import('@blackglory/errors').CustomErrorConstructor

interface IDerivedImageMetadata {
  format: 'jpeg' | 'webp'
  quality: number
  width: number
  height: number
}

interface IDerivedFontMetadata {
  format: 'woff' | 'woff2'
  subset: string
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

  /**
   * @throws {NotFound}
   * @throws {UnsupportedFontFormat}
   */
  ensureDerivedFont(params: {
    filename: string
    format: 'woff' | 'woff2'
    subset: string
  })

  getDerivedImageFilename(uuid: string): string
  getDerivedFontFilename(uuid: string): string

  NotFound: CustomErrorConstructor
  UnsupportedImageFormat: CustomErrorConstructor
  UnsupportedFontFormat: CustomErrorConstructor
}
