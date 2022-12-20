import { go } from '@blackglory/prelude'
import * as DataInSqlite3 from '@dao/data-in-sqlite3/database.js'
import { buildServer } from './server.js'
import { PORT, HOST, STORAGE, NODE_ENV, NodeEnv } from '@env/index.js'
import { ensureDirSync } from 'extra-filesystem'
import {
  getDerivedFontDirectory
, clearAllTemporaryDerivedFonts
} from '@core/derived-font.js'
import {
  getDerivedImageDirectory
, clearAllTemporaryDerivedImages
} from '@core/derived-image.js'
import { getStaticDirectory } from '@core/utils.js'
import { youDied } from 'you-died'

go(async () => {
  ensureDirSync(STORAGE())
  ensureDirSync(getStaticDirectory())
  ensureDirSync(getDerivedImageDirectory())
  ensureDirSync(getDerivedFontDirectory())

  await clearAllTemporaryDerivedFonts()
  await clearAllTemporaryDerivedImages()

  DataInSqlite3.openDatabase()
  youDied(() => DataInSqlite3.closeDatabase())
  await DataInSqlite3.prepareDatabase()

  const server = await buildServer()
  await server.listen({ port: PORT(), host: HOST() })
  if (NODE_ENV() === NodeEnv.Test) process.exit()

  process.send?.('ready')
})
