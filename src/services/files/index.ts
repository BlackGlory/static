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

interface IImageProcessingQuery {
  signature: string
  format: 'jpeg' | 'webp'
  quality: number
  maxWidth?: number
  maxHeight?: number
  multiple?: number
}

interface IFontProcessingQuery {
  signature: string
  format: 'woff' | 'woff2'
  subset: string
}

type IQuery = IImageProcessingQuery | IFontProcessingQuery

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
    Querystring: IImageProcessingQuery | IFontProcessingQuery 
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
              }
            , required: ['signature', 'format', 'quality']
            }
          , {
              type: 'object'
            , properties: {}
            }
          ]
        }
      }
    }
  , async (req, reply) => {
      const filename = req.params['*']

      if (req.query.signature) {
        if (!Core.validateSignature(req.query.signature, omit(req.query, ['signature']))) {
          return reply.status(403).send()
        }

        if (isIImageProcessQuery(req.query)) {
          let uuid: string
          try {
            uuid = await Core.ensureDerivedImage({ ...req.query, filename })
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

          const type = await getResultPromise(getFileType(Core.getDerivedImageFilename(uuid)))
          if (type) {
            reply.header('Content-Type', type.mime)
          }

          reply.header('Cache-Control', FOUND_CACHE_CONTROL())
          reply.header('Content-Disposition', contentDisposition(filename, {
            type: 'inline'
          }))
          reply.sendFile(path.join('derived-images', uuid))
        } else {
          let uuid: string
          try {
            uuid = await Core.ensureDerivedFont({ ...req.query, filename })
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

          const type = await getResultPromise(getFileType(Core.getDerivedFontFilename(uuid)))
          if (type) {
            reply.header('Content-Type', type.mime)
          }

          reply.header('Cache-Control', FOUND_CACHE_CONTROL())
          reply.header('Content-Disposition', contentDisposition(filename, {
            type: 'inline'
          }))
          reply.sendFile(path.join('derived-fonts', uuid))
        }
      } else {
        const type = await getResultPromise(
          getFileType(path.join(STORAGE(), 'files', filename))
        )
        if (type) {
          if (DISABLE_ACCESS_TO_ORIGINAL_IMAGES() && isImageExtension(type.ext)) {
            return reply.status(403).send()
          }

          if (DISABLE_ACCESS_TO_ORIGINAL_FONTS() && isFontExtension(type.ext)) {
            return reply.status(403).send()
          }

          reply.header('Content-Type', type.mime)
        }

        reply.header('Cache-Control', FOUND_CACHE_CONTROL())
        reply.header('Content-Disposition', contentDisposition(filename, {
          type: 'inline'
        }))
        reply.sendFile(path.join('files', filename))
      }
    }
  )
}

function isImageExtension(extension: string): boolean {
  return ['jpg', 'png',  'webp', 'apng', 'gif', 'avif', 'tif'].includes(extension)
}

function isFontExtension(extension: string): boolean {
  return ['woff', 'woff2', 'eot', 'ttf', 'otf'].includes(extension)
}

function isIImageProcessQuery(query: IQuery): query is IImageProcessingQuery {
  return query.format === 'jpeg'
      || query.format === 'webp'
}

function isFontProcessQuery(query: IQuery): query is IFontProcessingQuery {
  return query.format === 'woff'
      || query.format === 'woff2'
}
