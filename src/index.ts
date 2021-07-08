import { go } from '@blackglory/go'
import { buildServer } from './server'
import { PORT, HOST, CI } from '@env'

process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))

go(async () => {
  const server = await buildServer()
  await server.listen(PORT(), HOST())
  if (CI()) await process.exit()

  process.send?.('ready')
})
