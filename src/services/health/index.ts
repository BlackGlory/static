import { FastifyPluginAsync } from 'fastify'

export const routes: FastifyPluginAsync = async function routes(server) {
  server.get('/health', (req, reply) => {
    return reply.send('OK')
  })
}
