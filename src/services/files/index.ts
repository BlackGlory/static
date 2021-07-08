import { FastifyPluginAsync } from 'fastify'
import fastifyStatic from 'fastify-static'
import { DATA, FOUND_CACHE_CONTROL, NOT_FOUND_CACHE_CONTROL } from '@env'
import { ServerResponse } from 'http'
import { Stats } from 'fs'
import contentDisposition from 'content-disposition'

export const routes: FastifyPluginAsync = async function routes(server) {
  server.setNotFoundHandler((req, reply) => {
    reply.header('Cache-Control', NOT_FOUND_CACHE_CONTROL())
    reply.status(404)
    reply.send()
  })

  server.register(fastifyStatic, {
    root: DATA()
  , prefix: '/'
  , setHeaders(res: ServerResponse, path: string, stat: Stats) {
      res.setHeader('Cache-Control', FOUND_CACHE_CONTROL())
      res.setHeader('Content-Disposition', contentDisposition(path, { type: 'inline' }))
    }
  })
}
