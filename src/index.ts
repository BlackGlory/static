import { go } from '@blackglory/go'
import * as DataInSqlite3 from '@dao/data-in-sqlite3/database'
import { buildServer } from './server'
import { PORT, HOST, STORAGE, NODE_ENV, NodeEnv } from '@env'
import { ensureDirSync } from 'extra-filesystem'
import {
  getDerivedFontDirectory
, clearAllTemporaryDerivedFonts
} from '@core/derived-font'
import {
  getDerivedImageDirectory
, clearAllTemporaryDerivedImages
} from '@core/derived-image'
import { getStaticDirectory } from '@core/utils'

process.on('exit', () => {
  DataInSqlite3.closeDatabase()
})
process.on('SIGHUP', () => process.exit(128 + 1))
process.on('SIGINT', () => process.exit(128 + 2))
process.on('SIGTERM', () => process.exit(128 + 15))

go(async () => {
  ensureDirSync(STORAGE())
  ensureDirSync(getStaticDirectory())
  ensureDirSync(getDerivedImageDirectory())
  ensureDirSync(getDerivedFontDirectory())

  await clearAllTemporaryDerivedFonts()
  await clearAllTemporaryDerivedImages()

  DataInSqlite3.openDatabase()
  await DataInSqlite3.prepareDatabase()

  const server = await buildServer()
  await server.listen(PORT(), HOST())
  if (NODE_ENV() === NodeEnv.Test) process.exit()

  process.send?.('ready')
})
