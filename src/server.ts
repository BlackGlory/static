import { fastify } from 'fastify'
import cors from '@fastify/cors'
import { routes as files } from '@services/files/index.js'
import { routes as robots } from '@services/robots/index.js'
import { routes as health } from '@services/health/index.js'
import { NODE_ENV, NodeEnv } from '@env/index.js'
import { api } from '@api/index.js'
import path from 'path'
import { getAppRoot } from '@src/utils.js'
import { readJSONFileSync } from 'extra-filesystem'
import { isntUndefined, isString } from '@blackglory/prelude'
import { assert } from '@blackglory/errors'
import semver from 'semver'

const pkg = readJSONFileSync<{ version: string }>(
  path.join(getAppRoot(), 'package.json')
)

type LoggerLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export function buildServer() {
  const server = fastify({
    logger: getLoggerOptions()
  , forceCloseConnections: true
  })

  server.addHook('onRequest', async (req, reply) => {
    reply.headers({ 'Cache-Control': 'private, no-cache' })
  })
  server.addHook('onRequest', async (req, reply) => {
    const acceptVersion = req.headers['accept-version']
    if (isntUndefined(acceptVersion)) {
      assert(isString(acceptVersion), 'Accept-Version must be string')
      if (!semver.satisfies(pkg.version, acceptVersion)) {
        return reply.status(400).send()
      }
    }
  })

  server.register(cors, { origin: true })
  server.register(files, { prefix: '/files', api })
  server.register(robots)
  server.register(health)

  return server
}

function getLoggerOptions(): { level: LoggerLevel } | boolean {
  switch (NODE_ENV()) {
    case NodeEnv.Test: return false
    case NodeEnv.Production: return { level: 'error' }
    case NodeEnv.Development: return { level: 'trace' }
    default: return false
  }
}
