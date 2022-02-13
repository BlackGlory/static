import { FastifyPluginAsync } from 'fastify'
import fastifyStatic from 'fastify-static'
import {
  STORAGE
, DISABLE_ACCESS_TO_ORIGINAL_IMAGES
, DISABLE_ACCESS_TO_ORIGINAL_FONTS
, FOUND_CACHE_CONTROL
, NOT_FOUND_CACHE_CONTROL
} from '@env'
import contentDisposition from 'content-disposition'
import * as path from 'path'
import omit from 'lodash.omit'
import { fromFile as getFileType } from 'file-type'
import { getResultPromise } from 'return-style'
import mime from 'mrmime'

interface ICommonQuery {
  contentType?: string
}

interface IProcessingQuery {
  signature: string
  format: string
}

interface IImageProcessingQuery extends ICommonQuery, IProcessingQuery {
  signature: string
  format: 'jpeg' | 'webp'
  quality: number
  maxWidth?: number
  maxHeight?: number
  multiple?: number
}

interface IFontProcessingQuery extends ICommonQuery, IProcessingQuery {
  signature: string
  format: 'woff' | 'woff2'
  subset: string
}

type IQuery = ICommonQuery | IImageProcessingQuery | IFontProcessingQuery

export const routes: FastifyPluginAsync<{ Core: ICore }> =
async function routes(server, { Core }) {
  // 用server.setErrorHandler替代setNotFoundHandler的尝试失败了, 无法通过测试.
  server.setNotFoundHandler((req, reply) => {
    reply.header('Cache-Control', NOT_FOUND_CACHE_CONTROL())
    reply.status(404).send()
  })

  server.register(fastifyStatic, {
    root: STORAGE()
  , serve: false
  })

  server.get<{
    Params: {
      '*': string
    }
    Querystring: IQuery
  }>(
    '/*'
  , {
      schema: {
        querystring: {
          anyOf: [
            {
              type: 'object'
            , properties: {
                signature: { type: 'string' }
              , format: {
                  enum: ['woff', 'woff2']
                }
              , subset: { type: 'string' }
              , contentType: {
                  type: 'string'
                }
              }
            , required: ['signature', 'format', 'subset']
            }
          , {
              type: 'object'
            , properties: {
                signature: { type: 'string' }
              , format: {
                  enum: ['jpeg', 'webp']
                }
              , quality: {
                  type: 'integer'
                , minimum: 1
                , maximum: 100
                }
              , maxWidth: {
                  type: 'integer'
                , minimum: 1
                }
              , maxHeight: {
                  type: 'integer'
                , minimum: 1
                }
              , multiple: {
                  type: 'number'
                , exclusiveMinimum: 0
                }
              , contentType: {
                  type: 'string'
                }
              }
            , required: ['signature', 'format', 'quality']
            }
          , {
              type: 'object'
            , properties: {
                contentType: {
                  type: 'string'
                }
              }
            , additionalProperties: false
            }
          ]
        }
      }
    }
  , async (req, reply) => {
      const filename = req.params['*']

      if ('signature' in req.query) {
        if (!Core.validateSignature(req.query.signature, omit(req.query, ['signature']))) {
          return reply.status(403).send()
        }

        if (isIImageProcessQuery(req.query)) {
          await sendProcessedImage(req.query, filename)
        } else if (isFontProcessQuery(req.query)) {
          await sendProcessedFont(req.query, filename)
        } else {
          reply.status(400).send()
        }
      } else {
        await sendFile(req.query, filename)
      }

      async function sendFile(query: ICommonQuery, filename: string) {
        if (query.contentType) {
          reply.header('Content-Type', query.contentType)
        } else {
          const mimeType = mime.lookup(path.join(STORAGE(), 'files', filename))
          if (mimeType) {
            if (DISABLE_ACCESS_TO_ORIGINAL_IMAGES() && isImageMimeType(mimeType)) {
              return reply.status(403).send()
            }

            if (DISABLE_ACCESS_TO_ORIGINAL_FONTS() && isFontMimeType(mimeType)) {
              return reply.status(403).send()
            }

            reply.header('Content-Type', mimeType)
          }
        }

        reply.header('Cache-Control', FOUND_CACHE_CONTROL())
        reply.header('Content-Disposition', contentDisposition(filename, {
          type: 'inline'
        }))
        reply.sendFile(path.join('files', filename))
      }

      async function sendProcessedFont(query: IFontProcessingQuery, filename: string) {
        let uuid: string
        try {
          uuid = await Core.ensureDerivedFont({ ...query, filename })
        } catch (e) {
          if (e instanceof Core.NotFound) {
            reply.header('Cache-Control', NOT_FOUND_CACHE_CONTROL())
            return reply.status(404).send()
          }
          if (e instanceof Core.UnsupportedFontFormat) {
            // 返回403是说明没有权限对一个非字体文件/不支持的字体文件执行此操作
            return reply.status(403).send()
          }
          throw e
        }

        if (query.contentType) {
          reply.header('Content-Type', query.contentType)
        } else {
          const type = await getResultPromise(getFileType(Core.getDerivedFontFilename(uuid)))
          if (type) {
            reply.header('Content-Type', type.mime)
          }
        }

        reply.header('Cache-Control', FOUND_CACHE_CONTROL())
        reply.header('Content-Disposition', contentDisposition(filename, {
          type: 'inline'
        }))
        reply.sendFile(path.join('derived-fonts', uuid))
      }

      async function sendProcessedImage(query: IImageProcessingQuery, filename: string) {
        let uuid: string
        try {
          uuid = await Core.ensureDerivedImage({ ...query, filename })
        } catch (e) {
          if (e instanceof Core.NotFound) {
            reply.header('Cache-Control', NOT_FOUND_CACHE_CONTROL())
            return reply.status(404).send()
          }
          if (e instanceof Core.UnsupportedImageFormat) {
            // 返回403是说明没有权限对一个非图像文件/不支持的图像文件执行此操作
            return reply.status(403).send()
          }
          throw e
        }

        if (query.contentType) {
          reply.header('Content-Type', query.contentType)
        } else {
          const type = await getResultPromise(getFileType(Core.getDerivedImageFilename(uuid)))
          if (type) {
            reply.header('Content-Type', type.mime)
          }
        }

        reply.header('Cache-Control', FOUND_CACHE_CONTROL())
        reply.header('Content-Disposition', contentDisposition(filename, {
          type: 'inline'
        }))
        reply.sendFile(path.join('derived-images', uuid))
      }
    }
  )
}

function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

function isFontMimeType(mimeType: string): boolean {
  return mimeType.startsWith('font/')
}

function isIImageProcessQuery(query: IProcessingQuery): query is IImageProcessingQuery {
  return query.format === 'jpeg'
      || query.format === 'webp'
}

function isFontProcessQuery(query: IProcessingQuery): query is IFontProcessingQuery {
  return query.format === 'woff'
      || query.format === 'woff2'
}

async function getMimeType(filename: string): Promise<string | undefined> {
  // 和一般认识相反, 基于文件名判断MIME类型在实践中比判断数据更准确, 消耗的资源也较少.
  const mimeType = mime.lookup(filename)
  if (mimeType) return mimeType

  const type = await getResultPromise(getFileType(filename))
  return type?.mime
}
