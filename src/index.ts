import { go } from '@blackglory/go'
import * as DataInSqlite3 from '@dao/data-in-sqlite3/database'
import { buildServer } from './server'
import { PORT, HOST, CI, STORAGE } from '@env'
import { ensureDirSync } from 'extra-filesystem'
import * as path from 'path'

process.on('exit', () => {
  DataInSqlite3.closeDatabase()
})
process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))

go(async () => {
  ensureDirSync(STORAGE())
  ensureDirSync(path.join(STORAGE(), 'files'))
  ensureDirSync(path.join(STORAGE(), 'derived-images'))

  DataInSqlite3.openDatabase()
  await DataInSqlite3.prepareDatabase()

  const server = await buildServer()
  await server.listen(PORT(), HOST())
  if (CI()) await process.exit()

  process.send?.('ready')
})
