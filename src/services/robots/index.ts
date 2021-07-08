import { FastifyPluginAsync } from 'fastify'
import { stripIndent } from 'common-tags'

export const routes: FastifyPluginAsync = async function routes(server) {
  server.get('/robots.txt', (req, reply) => {
    const text = stripIndent`
      User-agent: *
      Disallow: /
    `

    reply
      .header('Content-Type', 'text/plain')
      .send(text)
  })
}
