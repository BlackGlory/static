import { FastifyPluginAsync } from 'fastify'
// 使用的是修改后的fastify-static, 因为 https://github.com/fastify/fastify-static/issues/218
import fastifyStatic from 'fastify-static'
import { STORAGE, FOUND_CACHE_CONTROL, NOT_FOUND_CACHE_CONTROL } from '@env'
import contentDisposition from 'content-disposition'
import * as path from 'path'
import omit from 'lodash.omit'
import { fromFile as getFileType } from 'file-type'
import { getResultPromise } from 'return-style'

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
    Querystring: {
      signature: string
      format: 'jpeg' | 'webp'
      quality: number
      maxWidth?: number
      maxHeight?: number
      multiple?: number
    }
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
            , additionalProperties: false
            , required: ['signature', 'format', 'quality']
            }
          , {
              type: 'object'
            , properties: {}
            , additionalProperties: false
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

        let uuid: string
        try {
          uuid = await Core.ensureDerivedImage({ ...req.query, filename })
        } catch (e) {
          if (e instanceof Core.NotFound) {
            reply.header('Cache-Control', NOT_FOUND_CACHE_CONTROL())
            return reply.status(404).send()
          }
          if (e instanceof Core.UnsupportedImageFormat) return reply.status(403).send()
          throw e
        }

        const type = await getResultPromise(
          getFileType(path.join(STORAGE(), 'derived-images', uuid))
        )
        if (type) reply.header('Content-Type', type.mime)

        reply.header('Cache-Control', FOUND_CACHE_CONTROL())
        reply.header('Content-Disposition', contentDisposition(filename, { type: 'inline' }))
        reply.sendFile(path.join('derived-images', uuid))
      } else {
        const type = await getResultPromise(
          getFileType(path.join(STORAGE(), 'files', filename))
        )
        if (type) reply.header('Content-Type', type.mime)

        reply.header('Cache-Control', FOUND_CACHE_CONTROL())
        reply.header('Content-Disposition', contentDisposition(filename, { type: 'inline' }))
        reply.sendFile(path.join('files', filename))
      }
    }
  )
}
